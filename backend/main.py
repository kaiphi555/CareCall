import os
import json
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
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

NGROK_URL = os.getenv("NGROK_URL", "https://example.ngrok-free.dev") # Reload trigger

# ---------- Models ----------

class CallRequest(BaseModel):
    patient_name: str
    medication: str
    phone_number: str

class WellnessAnalysisRequest(BaseModel):
    patient_name: str
    questions_and_answers: list  # [{"question": "...", "answer": "..."}, ...]

# ---------- Call Logic ----------

def make_call(patient_name: str, medication: str, phone_number: str, dosage: str = ""):
    if dosage:
        script = f"Hello {patient_name}. This is your CareCall reminder. It is time to take your {dosage} of {medication}. Please take it now."
    else:
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
        to=phone_number, from_=os.getenv("TWILIO_PHONE_NUMBER"), twiml=twiml,
        status_callback=f"{NGROK_URL}/call-status",
        status_callback_method='POST'
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

                # Look up medication name + dosage via medication_id if available
                med_name = "your medication"
                med_dosage = ""
                med_id = call.get("medication_id")
                if med_id:
                    med_result = sb.table("medications").select("name, dosage").eq("id", med_id).limit(1).execute()
                    if med_result.data:
                        med_name = med_result.data[0].get("name", "your medication")
                        med_dosage = med_result.data[0].get("dosage", "")
                else:
                    med_result = sb.table("medications").select("name, dosage").eq("patient_id", call.get("patient_id", "")).limit(1).execute()
                    if med_result.data:
                        med_name = med_result.data[0].get("name", "your medication")
                        med_dosage = med_result.data[0].get("dosage", "")

                try:
                    print(f"📞 Triggering scheduled call to {patient_name} at {phone} for {med_dosage} of {med_name}")
                    call_sid = make_call(patient_name, med_name, phone, med_dosage)
                    print(f"✅ Call triggered: {call_sid}")

                    # Update status to calling and save twilio_sid. The webhook will handle completion and recurrence.
                    sb.table("scheduled_calls").update({
                        "status": "calling",
                        "twilio_sid": call_sid
                    }).eq("id", call["id"]).execute()
                except Exception as e:
                    print(f"❌ Call failed: {e}")
                    sb.table("scheduled_calls").update({
                        "status": "failed", 
                        "adherence_status": "missed"
                    }).eq("id", call["id"]).execute()
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

from urllib.parse import parse_qs

@app.post("/call-status")
async def twilio_call_status(request: Request):
    if not sb: return {"status": "error", "message": "Supabase not configured"}
    
    body = await request.body()
    parsed = parse_qs(body.decode('utf-8'))
    call_sid = parsed.get("CallSid", [None])[0]
    call_status = parsed.get("CallStatus", [None])[0]
    
    print(f"📥 Received Twilio callback for {call_sid}: {call_status}")
    if not call_sid: return {"status": "ignored"}
    
    # Find the scheduled call
    call_res = sb.table("scheduled_calls").select("*").eq("twilio_sid", call_sid).execute()
    if not call_res.data:
        print("   -> No matching scheduled_call found for this SID.")
        return {"status": "not_found"}
        
    call = call_res.data[0]
    
    if call["status"] in ["completed", "failed", "no-answer", "busy", "canceled"]:
        return {"status": "already_processed"}

    # Updated adherence logic for button-based tracking:
    # We log the call outcome, but only button clicks mark it as 'taken'.
    # If the call was missed/busy/failed, we mark it as 'missed'.
    # If it was completed (answered), we leave adherence as 'pending' (waiting for button).
    
    adherence = "missed" if call_status in ["no-answer", "busy", "failed", "canceled"] else "pending"
    
    # Update call record
    final_status = call_status if call_status != "in-progress" else "completed"
    
    sb.table("scheduled_calls").update({
        "status": final_status,
        "adherence_status": adherence
    }).eq("id", call["id"]).execute()
    print(f"   -> Updated call {call['id']} status to {final_status}, adherence: {adherence}")
    
    # Automatically schedule tomorrow's call if recurring
    if call.get("recurring"):
        next_date = (datetime.strptime(call.get("date"), "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # We spawn a NEW row for tomorrow, so we keep historical records intact
        sb.table("scheduled_calls").insert({
            "patient_id": call.get("patient_id"),
            "patient_name": call.get("patient_name"),
            "date": next_date,
            "time": call.get("time"),
            "purpose": call.get("purpose"),
            "status": "scheduled",
            "medication_id": call.get("medication_id"),
            "recurring": True,
            "adherence_status": "pending"
        }).execute()
        print(f"   -> 🔁 Spawned new recurring call for {next_date}")
        
    return {"status": "success"}

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