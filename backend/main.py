import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from twilio.rest import Client
from fastapi.middleware.cors import CORSMiddleware

# Load your .env file
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows any frontend to connect (perfect for hackathons)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Toggle: set to True in .env when you have an ElevenLabs API key
USE_ELEVENLABS = os.getenv("USE_ELEVENLABS", "false").lower() == "true"

# Initialize API Clients
if USE_ELEVENLABS:
    from elevenlabs.client import ElevenLabs
    eleven_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

twilio_client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))

# Replace this with your ngrok URL later
NGROK_URL = "https://areocentric-latricia-overdiscriminatingly.ngrok-free.dev"

class CallRequest(BaseModel):
    patient_name: str
    medication: str
    phone_number: str

@app.post("/trigger-call")
def trigger_medication_call(request: CallRequest):
    # 1. Generate the script
    script = f"Hello {request.patient_name}. This is your CareCall reminder. It is time to take your {request.medication}. Please take it now."

    if USE_ELEVENLABS:
        # ---------- ElevenLabs path (custom AI voice) ----------
        audio_generator = eleven_client.text_to_speech.convert(
            text=script,
            voice_id="JBFqnCBsd6RMkjVDRZzb", # Default 'Rachel' voice
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
        # ---------- Twilio-only path (built-in TTS) ----------
        twiml_instructions = f"""
        <Response>
            <Say voice="Polly.Joanna" language="en-US">{script}</Say>
        </Response>
        """

    call = twilio_client.calls.create(
        to=request.phone_number,
        from_=os.getenv("TWILIO_PHONE_NUMBER"),
        twiml=twiml_instructions
    )

    return {"status": "Calling now", "call_sid": call.sid, "mode": "elevenlabs" if USE_ELEVENLABS else "twilio-tts"}

# 5. This endpoint serves the MP3 file to Twilio
@app.get("/audio")
def get_audio():
    return FileResponse("static/reminder.mp3", media_type="audio/mpeg")