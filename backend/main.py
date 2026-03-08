import os
import json
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from twilio.rest import Client
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from supabase import create_client
from google import genai

# Load .env
load_dotenv()

# Toggle: set to True in .env when you have an ElevenLabs API key
USE_ELEVENLABS = os.getenv("USE_ELEVENLABS", "false").lower() == "true"

if USE_ELEVENLABS:
    from elevenlabs.client import ElevenLabs
    eleven_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

twilio_client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))

# Supabase client
supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY", "")
sb = None
if supabase_url and supabase_key:
    sb = create_client(supabase_url, supabase_key)

# Gemini AI (new google-genai SDK)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
gemini_client = None
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)

NGROK_URL = os.getenv("NGROK_URL", "https://example.ngrok-free.dev")

# ---------- Models ----------

class CallRequest(BaseModel):
    patient_name: str
    medication: str
    phone_number: str

class WellnessAnalysisRequest(BaseModel):
    patient_name: str
    questions_and_answers: list  # [{"question": "...", "answer": "..."}, ...]

# ---------- Call Logic ----------

def make_call(patient_name: str, medication: str, phone_number: str):
    script = f"Hello {patient_name}. This is your CareCall reminder. It is time to take your {medication}. Please take it now."

    if USE_ELEVENLABS:
        audio_generator = eleven_client.text_to_speech.convert(
            text=script, voice_id="JBFqnCBsd6RMkjVDRZzb",
            model_id="eleven_multilingual_v2", output_format="mp3_44100_128"
        )
        os.makedirs("static", exist_ok=True)
        with open("static/reminder.mp3", "wb") as f:
            for chunk in audio_generator:
                if chunk: f.write(chunk)
        twiml = f'<Response><Play>{NGROK_URL}/audio</Play></Response>'
    else:
        twiml = f'<Response><Say voice="Polly.Joanna" language="en-US">{script}</Say></Response>'

    call = twilio_client.calls.create(
        to=phone_number, from_=os.getenv("TWILIO_PHONE_NUMBER"), twiml=twiml
    )
    return call.sid

# ---------- Scheduler ----------

def check_scheduled_calls():
    if not sb: return
    now = datetime.now()
    today = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M")

    try:
        result = sb.table("scheduled_calls") \
            .select("*, profiles!scheduled_calls_patient_id_fkey(name, phone)") \
            .eq("status", "scheduled").lte("date", today).execute()

        if not result.data: return

        for call in result.data:
            call_time = call.get("time", "")
            call_date = call.get("date", "")

            if call_date < today or (call_date == today and call_time <= current_time):
                patient = call.get("profiles") or {}
                patient_name = patient.get("name") or call.get("patient_name", "Patient")
                phone = patient.get("phone", "")

                if not phone:
                    sb.table("scheduled_calls").update({"status": "failed"}).eq("id", call["id"]).execute()
                    continue

                med_name = "your medication"
                med_result = sb.table("medications").select("name").eq("patient_id", call.get("patient_id", "")).limit(1).execute()
                if med_result.data: med_name = med_result.data[0]["name"]

                try:
                    print(f"📞 Triggering scheduled call to {patient_name} at {phone}")
                    call_sid = make_call(patient_name, med_name, phone)
                    sb.table("scheduled_calls").update({"status": "completed"}).eq("id", call["id"]).execute()
                    print(f"✅ Call triggered: {call_sid}")
                except Exception as e:
                    print(f"❌ Call failed: {e}")
                    sb.table("scheduled_calls").update({"status": "failed"}).eq("id", call["id"]).execute()
    except Exception as e:
        print(f"Scheduler error: {e}")

scheduler = BackgroundScheduler()
scheduler.add_job(check_scheduled_calls, 'interval', seconds=30)

@asynccontextmanager
async def lifespan(app):
    scheduler.start()
    print("🗓️  Call scheduler started (checking every 30 seconds)")
    yield
    scheduler.shutdown()

# ---------- App ----------

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

@app.post("/trigger-call")
def trigger_medication_call(request: CallRequest):
    call_sid = make_call(request.patient_name, request.medication, request.phone_number)
    return {"status": "Calling now", "call_sid": call_sid, "mode": "elevenlabs" if USE_ELEVENLABS else "twilio-tts"}

@app.get("/audio")
def get_audio():
    return FileResponse("static/reminder.mp3", media_type="audio/mpeg")

@app.post("/analyze-wellness")
def analyze_wellness(request: WellnessAnalysisRequest):
    """Use Gemini to analyze wellness check-in responses."""
    if not gemini_client:
        return {
            "insight": "",
            "caretaker_summary": "",
            "observations": [],
            "recommendations": [],
            "alert_caretaker": False,
            "alert_reason": "",
            "error": "GEMINI_API_KEY not set",
        }

    # Separate multiple-choice from free response
    FREE_Q = "Is there anything else you'd like to share today?"
    mc_items = [item for item in request.questions_and_answers if item.get("question") != FREE_Q]
    free_response = next((item.get("answer", "") for item in request.questions_and_answers if item.get("question") == FREE_Q), "")

    mc_text = "\n".join([f"Q: {item['question']}\nA: {item['answer']}" for item in mc_items])

    prompt = f"""You are an empathetic, knowledgeable health assistant for elderly patients. A patient named {request.patient_name} just completed their daily wellness check-in.

Here are their multiple-choice responses:
{mc_text}

{"The patient also shared the following in their own words:" if free_response.strip() else "The patient did not leave any additional comments."}
{f'"{free_response}"' if free_response.strip() else ""}

Provide a thorough analysis. Pay SPECIAL ATTENTION to the patient's free-text response — this is their own voice and may reveal important details about their physical or emotional state that the multiple-choice questions don't capture.

Return these fields:

1. **insight** (4-6 sentences): A warm, personalized health insight addressed to the patient. Reference their specific answers AND their free-text response if they wrote one. Provide relevant health advice, acknowledge their feelings, and be encouraging. Do NOT include any numerical scores.

2. **caretaker_summary** (2-3 sentences): A clinical but compassionate summary for the caretaker. Be direct about any concerns. Highlight anything from the free-text response that the caretaker should know about.

3. **observations** (2-4 items): Array of specific observations (e.g. "Patient mentioned knee pain when walking", "Reports difficulty sleeping", "Expressed feeling lonely").

4. **recommendations** (1-3 items): Array of actionable suggestions (e.g. "Monitor hydration levels", "Schedule a follow-up about joint pain", "Consider arranging a social visit").

5. **alert_caretaker** (true/false): Set to TRUE if the patient mentions or indicates ANY of: pain, dizziness, falls, missed medications, emotional distress, sadness, loneliness, confusion, breathing difficulties, appetite loss, isolation, injury, or any other health concern. When in doubt, alert the caretaker.

6. **alert_reason** (1 sentence if alerting, empty string otherwise): Clear, specific reason for the alert that the caretaker can act on.

Respond ONLY with valid JSON, no markdown fences:
{{"insight": "...", "caretaker_summary": "...", "observations": ["..."], "recommendations": ["..."], "alert_caretaker": false, "alert_reason": ""}}"""

    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt,
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        result = json.loads(text)
        return {
            "insight": result.get("insight", "Thank you for completing your check-in!"),
            "caretaker_summary": result.get("caretaker_summary", ""),
            "observations": result.get("observations", []),
            "recommendations": result.get("recommendations", []),
            "alert_caretaker": result.get("alert_caretaker", False),
            "alert_reason": result.get("alert_reason", ""),
        }
    except Exception as e:
        print(f"Gemini analysis error: {e}")
        return {
            "insight": "",
            "caretaker_summary": "",
            "observations": [],
            "recommendations": [],
            "alert_caretaker": False,
            "alert_reason": "",
            "error": str(e),
        }