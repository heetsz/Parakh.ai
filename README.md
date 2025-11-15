
https://parakh-ai.onrender.com
https://parakh-ai-node.onrender.com/api
https://parakh-ai-fastapi.onrender.com

fastapi:-

FRONTEND_URL="http://localhost:5173"
GEMINI_API_KEY="AIzaSyAsgZ_JEh9h7LLtnCJ-Dy7bEdO3B0EjNu0"
GROQ_API_KEY="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"
GROQ_API_KEY_H="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"
GROQ_LLM_MODEL="llama-3.1-8b-instant"
GROQ_STT_MODEL="whisper-large-v3"

server:-

ACCESS_TOKEN="94dd55d51aa2ce36d187042fe6fb5dc011b3f20954792132a89afb4a5df5b7b789d1bcdc131eaf23f634d67c342055d735d8367f25b8f8c245bc0e2eba0c7bf0"
DB_URI="mongodb+srv://heet_shah123:12345@parakhaicluater.zl5u3rp.mongodb.net/"
EMAIL_PASS="ywmwfnqdtbyrdokp"
EMAIL_USER="heets4307@gmail.com"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT="5000"
CLOUDINARY_CLOUD_NAME="dzf91c7rz"
CLOUDINARY_API_KEY="112787379446343"
CLOUDINARY_API_SECRET="rMZYFQAzIzaqyhiXY-zzDL0FlMw"
CLOUDINARY_PRESET_NAME="parakhai"
FASTAPI_URL="http://localhost:8000"
GEMINI_API_KEY="AIzaSyAsgZ_JEh9h7LLtnCJ-Dy7bEdO3B0EjNu0"
FROM_EMAIL="heets4307@gmail.com"
SENDGRID_API_KEY="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"

client:-

VITE_BACKEND_URL="http://localhost:5000/api"
VITE_AI_WS="ws://localhost:8000"
VITE_AI_HTTP="http://localhost:8000"
VITE_CLOUD_NAME="dzf91c7rz"
VITE_API_KEY="112787379446343"
VITE_SECRET_KEY="rMZYFQAzIzaqyhiXY-zzDL0FlMw"
VITE_PRESET_NAME="parakhai"
VITE_GEMINI_API_KEY="AIzaSyAsgZ_JEh9h7LLtnCJ-Dy7bEdO3B0EjNu0"




to run fastapi

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

for client and server 
npm i && npm run dev