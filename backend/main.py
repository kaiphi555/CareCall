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
import google.generativeai as genai

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

# Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
gemini_model = None
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.0-flash")

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
    if not gemini_model:
        return {
            "feedback": "AI analysis is not available. Please set GEMINI_API_KEY in your .env file.",
            "alert_caretaker": False,
            "alert_reason": "",
            "mood_score": 5,
        }

    # Build the prompt
    qa_text = "\n".join([
        f"Q: {item['question']}\nA: {item['answer']}"
        for item in request.questions_and_answers
    ])

    prompt = f"""You are a caring health assistant for elderly patients. A patient named {request.patient_name} just completed their daily wellness check-in. Analyze their responses and provide:

1. A short, warm, encouraging feedback message (2-3 sentences max) addressed directly to the patient. Be supportive and conversational.
2. Whether the caretaker should be alerted (true/false). Alert if: the patient reports feeling unwell, pain, dizziness, missed medications, poor sleep, sadness, or any concerning symptom.
3. If alerting, a brief reason for the alert (1 sentence).
4. A mood score from 1-10 (1=very concerning, 10=great).

Patient responses:
{qa_text}

Respond ONLY with valid JSON in this exact format, no markdown:
{{"feedback": "...", "alert_caretaker": true/false, "alert_reason": "...", "mood_score": 5}}"""

    try:
        response = gemini_model.generate_content(prompt)
        text = response.text.strip()
        # Clean markdown fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        result = json.loads(text)
        return {
            "feedback": result.get("feedback", "Thank you for completing your check-in!"),
            "alert_caretaker": result.get("alert_caretaker", False),
            "alert_reason": result.get("alert_reason", ""),
            "mood_score": result.get("mood_score", 5),
        }
    except Exception as e:
        print(f"Gemini analysis error: {e}")
        return {
            "feedback": "Thank you for completing your wellness check-in today! Your responses have been recorded.",
            "alert_caretaker": False,
            "alert_reason": "",
            "mood_score": 5,
        }