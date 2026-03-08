import os
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

# Load your .env file
load_dotenv()

# Toggle: set to True in .env when you have an ElevenLabs API key
USE_ELEVENLABS = os.getenv("USE_ELEVENLABS", "false").lower() == "true"

# Initialize API Clients
if USE_ELEVENLABS:
    from elevenlabs.client import ElevenLabs
    eleven_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

twilio_client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))

# Supabase client for reading scheduled calls
supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY", "")
sb = None
if supabase_url and supabase_key:
    sb = create_client(supabase_url, supabase_key)

# Replace this with your ngrok URL if using ElevenLabs
NGROK_URL = os.getenv("NGROK_URL", "https://example.ngrok-free.dev")

class CallRequest(BaseModel):
    patient_name: str
    medication: str
    phone_number: str

def make_call(patient_name: str, medication: str, phone_number: str):
    """Trigger a Twilio call to the patient."""
    script = f"Hello {patient_name}. This is your CareCall reminder. It is time to take your {medication}. Please take it now."

    if USE_ELEVENLABS:
        audio_generator = eleven_client.text_to_speech.convert(
            text=script,
            voice_id="JBFqnCBsd6RMkjVDRZzb",
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128"
        )
        file_path = "static/reminder.mp3"
        os.makedirs("static", exist_ok=True)
        with open(file_path, "wb") as f:
            for chunk in audio_generator:
                if chunk:
                    f.write(chunk)
        twiml_instructions = f"""
        <Response>
            <Play>{NGROK_URL}/audio</Play>
        </Response>
        """
    else:
        twiml_instructions = f"""
        <Response>
            <Say voice="Polly.Joanna" language="en-US">{script}</Say>
        </Response>
        """

    call = twilio_client.calls.create(
        to=phone_number,
        from_=os.getenv("TWILIO_PHONE_NUMBER"),
        twiml=twiml_instructions
    )
    return call.sid

def check_scheduled_calls():
    """Check Supabase for calls that are due and trigger them."""
    if not sb:
        return

    now = datetime.now()
    today = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M")

    try:
        # Find scheduled calls that are due (date <= today, time <= now, status = scheduled)
        result = sb.table("scheduled_calls") \
            .select("*, profiles!scheduled_calls_patient_id_fkey(name, phone)") \
            .eq("status", "scheduled") \
            .lte("date", today) \
            .execute()

        if not result.data:
            return

        for call in result.data:
            call_time = call.get("time", "")
            call_date = call.get("date", "")

            # Check if this call is due (date is today or past AND time has passed)
            if call_date < today or (call_date == today and call_time <= current_time):
                patient = call.get("profiles") or {}
                patient_name = patient.get("name") or call.get("patient_name", "Patient")
                phone = patient.get("phone", "")

                if not phone:
                    print(f"⚠️  No phone for scheduled call {call['id']}, skipping")
                    # Mark as failed
                    sb.table("scheduled_calls").update({"status": "failed"}).eq("id", call["id"]).execute()
                    continue

                # Get first medication for this patient
                med_name = "your medication"
                med_result = sb.table("medications").select("name").eq("patient_id", call.get("patient_id", "")).limit(1).execute()
                if med_result.data:
                    med_name = med_result.data[0]["name"]

                try:
                    print(f"📞 Triggering scheduled call to {patient_name} at {phone}")
                    call_sid = make_call(patient_name, med_name, phone)
                    # Mark as completed
                    sb.table("scheduled_calls").update({"status": "completed"}).eq("id", call["id"]).execute()
                    print(f"✅ Call triggered: {call_sid}")
                except Exception as e:
                    print(f"❌ Call failed: {e}")
                    sb.table("scheduled_calls").update({"status": "failed"}).eq("id", call["id"]).execute()

    except Exception as e:
        print(f"Scheduler error: {e}")


# --- Background scheduler ---
scheduler = BackgroundScheduler()
scheduler.add_job(check_scheduled_calls, 'interval', seconds=30)  # Check every 30 seconds

@asynccontextmanager
async def lifespan(app):
    # Startup
    scheduler.start()
    print("🗓️  Call scheduler started (checking every 30 seconds)")
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/trigger-call")
def trigger_medication_call(request: CallRequest):
    call_sid = make_call(request.patient_name, request.medication, request.phone_number)
    return {"status": "Calling now", "call_sid": call_sid, "mode": "elevenlabs" if USE_ELEVENLABS else "twilio-tts"}

@app.get("/audio")
def get_audio():
    return FileResponse("static/reminder.mp3", media_type="audio/mpeg")