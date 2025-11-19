<div align="center">

# Parakh.ai

**An adaptive AI-driven mock interview & preparation platform combining real‑time conversational AI, structured practice (OA / System Design), progress analytics, and a collaborative community.**

🔗 **Live Link:** https://grabify.link/2YTYX8

Test Credentials:-
Username : maxvoyager
Password : qwer

<br/>
</div>

<img width="1919" height="911" alt="image" src="https://github.com/user-attachments/assets/9252d060-1611-48b1-bfce-bf913ff13995" />



## 🎯 What Is Parakh.ai?

Parakh.ai is a modern web application that simulates real technical interviews with an AI interviewer, helping candidates sharpen communication, reasoning, and problem‑solving under realistic conditions. Unlike static Q&A tools, it delivers a dynamic multi‑modal experience: you speak, it listens (Speech‑to‑Text), reasons (LLM), responds with synthesized voice (Text‑to‑Speech), and tracks progress over time.

The platform adds depth with:
- **Live AI Interview Sessions** – Real‑time bi‑directional conversation via WebSockets (speech → AI reasoning → voice reply). Choose your AI persona/model.
- **OA (Online Assessment) Practice & Progress** – Structured problem sets and tracking modules.
- **System Design Board** – Visual brainstorming surface (whiteboard/tooling) for practicing architectural discussions.
- **Community Space** – Share insights, posts, likes, and discussion threads with avatars.
- **Personalization** – Pick an AI interviewer style, upload an avatar, change display name, configure email, and manage account settings.
- **Glassmorphic & Minimal UI** – Clean, distraction‑free interface with polished interview room layout.
- 
<img width="1898" height="916" alt="image" src="https://github.com/user-attachments/assets/1fea546b-0f4b-4af8-a6d8-0931cf089265" />

<img width="1896" height="921" alt="image" src="https://github.com/user-attachments/assets/c06450dd-a112-440c-9726-6c145cd545f2" />

## 🧠 Core Value Proposition

Parakh.ai accelerates readiness for technical interviews by emulating the *human communication layer* (follow‑ups, clarifications, contextual memory) while retaining measurable structure and feedback loops. It blends:

| Capability | Benefit |
|------------|---------|
| Real‑time speech pipeline (STT → LLM → TTS) | Practice verbal articulation under pressure |
| AI persona selection | Tailor difficulty & tone |
| Transient transcript bubbles | Encourage active listening (no crutch scrolling) |
| Progress dashboards | Reinforce growth through data |
| Community & collaboration | Motivation + peer learning |

## 🏗️ High-Level Architecture

```
┌────────────────────────────┐
│          Client (React)    │
│  • Interview UI            │
│  • Settings / Auth / OA    │
│  • Community / Design      │
└─────────────┬──────────────┘
		│ HTTPS + WS
┌─────────────▼──────────────┐
│     Node.js API Server     │
│  • Auth / JWT Cookies      │
│  • Users / Interviews      │
│  • Posts / Comments / OA   │
│  • Cloudinary (avatars)    │
│  • SendGrid (email)        │
└─────────────┬──────────────┘
		│ WebSocket (speech events)
┌─────────────▼──────────────┐
│       FastAPI Service       │
│  • STT / LLM / TTS via      │
│    Groq clients (round‑robin)│
│  • Voice fallback logic     │
└─────────────┬──────────────┘
		│ External APIs
	┌──────▼──────────────┐
	│ Groq AI (LLM/STT/TTS)│
	└─────────────────────┘
```

## 🧩 Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React (Vite), Tailwind CSS, shadcn/ui, Axios, WebSocket, MediaRecorder |
| Backend (Core) | Node.js, Express, Mongoose, JWT, Multer, Cloudinary, SendGrid |
| AI Microservice | FastAPI (Python), Groq SDK (LLM/STT/TTS), Round‑robin TTS client strategy |
| Data | MongoDB (Users, Interviews, Posts, OA Tests) |
| Auth | Cookie-based JWT sessions + email verification |
| Media | Browser getUserMedia (audio/video), dynamic TTS playback |

## 🔐 Key Features (Detailed)

### Live Interview Room
- Dual avatar circles (User vs AI) with animated speaking states.
- Microphone & camera independent toggles (camera off by default).
- Keyboard shortcut for mute/unmute (Ctrl/Cmd + K).
- Ephemeral transcript bubbles that fade—simulates attention pressure.
- Dynamic AI persona (name + avatar + voice) selected in Settings.

### AI Voice & Reasoning
- Alternating Groq TTS clients to reduce rate limit collisions.
- Voice override per session with graceful fallback on error.
- Structured pipeline: user speech → STT → LLM prompt engineering → TTS synthesis → streamed playback.

### Preparation Modules
- OA (Online Assessment) dashboard & progress trackers.
- System Design board (visual thinking surface).
- Interview progress summaries.

### Community Layer
- Posts with likes & comments.
- Per-user avatars (Cloudinary upload) & dynamic retrieval.
- Lightweight feed for engagement and peer support.

### Account & Personalization
- Avatar upload (Multer memory → Cloudinary).
- Email / password / display name updates.
- AI Interviewer model selection (persona roster).
- Full account deletion cascade (interviews, posts, likes, comments).

### Resilience & UX Details
- Non-blocking error toasts for verification.
- Fallback AI voice & placeholder avatars.
- Environmental validation for email sending.

## 🚀 Getting Started (Local Development)

### 1. Clone
```bash
git clone https://github.com/heetsz/Parakh.ai.git
cd Parakh.ai
```

### 2. Install Dependencies
```bash
# Client
cd Client
npm install

# Server (Node API)
cd ../Server
npm install

# FastAPI Service
cd ../FastAPI
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file in `Server/` with (example):
```
MONGO_URI=...
JWT_SECRET=...
SENDGRID_API_KEY=...
FROM_EMAIL=verified-sender@example.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Create a `.env` or config in `FastAPI/` (e.g. `.env` loaded via python-dotenv) with:
```
GROQ_API_KEY=...
GROQ_API_KEY_H=...   # Secondary key for TTS round‑robin
GROQ_TTS_MODEL=...   # e.g. some supported Groq voice model
DEFAULT_TTS_VOICE=... # Fallback voice
```

Client Vite config (`Client/.env`):
```
VITE_BACKEND_URL=http://localhost:5000
VITE_FASTAPI_WS_URL=ws://localhost:8000/ws
```

### 4. Run Services
```bash
# Node API (from Server/)
npm run dev

# FastAPI (from FastAPI/)
uvicorn app.main:app --reload --port 8000

# Client (from Client/)
npm run dev
```

Navigate to: `http://localhost:5173`

### 5. Account Flow
1. Register → Email verification (SendGrid).
2. Log in → Access dashboard.
3. Configure persona in Settings.
4. Start a live interview session.

## 🌐 Deployment Notes

The live instance is hosted at: **https://parakh-ai.onrender.com/**

Typical deployment considerations:
- Split services: host Node API and FastAPI separately (containerized or managed platforms).
- Environment variable injection (CI/CD secrets).
- WebSocket termination (ensure proxy retains upgrade headers).
- CORS allowlist (client domain + deployment origin).
- Cloudinary & SendGrid verified domains.

## 🧪 Future Enhancements (Roadmap)
- Adaptive difficulty scaling (real‑time scoring influences next question complexity).
- Structured question categories: algorithms, behavioral, systems, ML.
- Session replay analytics (word clouds, filler word reduction stats).
- In‑browser code execution sandbox for OA tasks.
- Multi‑participant mock panel interviews.
- Model health / provider fallback abstraction (SendGrid → alternate email provider).

## 🔍 Troubleshooting
| Issue | Likely Cause | Resolution |
|-------|--------------|------------|
| Verification email not received | Unverified sender / spam filter | Check spam; verify sender domain in SendGrid; ensure FROM_EMAIL matches verified identity |
| TTS voice silent | Unsupported voice ID | Confirm env voice vars; fallback engages automatically |
| WebSocket disconnects | Proxy upgrade not preserved | Configure reverse proxy (Nginx / Render) for `Connection: upgrade` |
| Avatar not updating | Cloudinary credentials mismatch | Recheck API key/secret & unsigned preset if used |

## 🛡️ Security Considerations
- JWT stored in HttpOnly cookies (mitigates XSS token theft).
- Passwords hashed with bcrypt.
- Controlled file upload (memory buffer → Cloudinary, no disk persistence).
- Input validation on critical mutation routes.

## 📂 Repository Structure (Simplified)
```
Client/      # React UI (Interview room, Settings, Community, Dashboards)
Server/      # Node.js Express API (auth, interviews, posts, settings)
FastAPI/     # Python microservice for STT/LLM/TTS pipeline
```

## 🤝 Contributing
1. Fork & branch: `feat/your-feature`
2. Follow existing lint/style conventions.
3. Provide concise PR description (intent + approach + test notes).

## 📜 License
Currently proprietary / all rights reserved (update this section if you adopt an OSS license).

## 💬 Contact
For collaboration or support, open an issue or reach out via the deployment’s contact channel (email verification system sender address).

---

**Parakh.ai** – Practice boldly. Interview confidently.

