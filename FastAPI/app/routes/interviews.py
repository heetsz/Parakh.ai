from typing import Optional, List
import json
import os
from pydantic import BaseModel
from fastapi import APIRouter

from ..services.groq_client import get_groq_client, GROQ_LLM_MODEL

router = APIRouter()


class InterviewSpec(BaseModel):
    title: Optional[str]
    role: Optional[str]
    experience: Optional[str]
    type: Optional[str]
    difficulty: Optional[str]
    resume: Optional[str]
    notes: Optional[str]


@router.post("/interviews/generate")
async def generate_interview(spec: InterviewSpec):
    """Generate an interview plan (list of questions) based on the spec using the LLM.

    Returns a JSON object with fields: title (may be adjusted) and questions: [{question, topic, difficulty}]
    """
    groq_client = get_groq_client()
    if not groq_client:
        return {"error": "GROQ_API_KEY not configured"}

    model = os.getenv("GROQ_LLM_MODEL", GROQ_LLM_MODEL)

    system_prompt = (
        "You are an expert interviewer generator. Given a job role, candidate experience level, "
        "interview type, difficulty, and optional resume/notes, produce a JSON object with a concise title "
        "and an array of 6-10 interview questions appropriate to the role and difficulty. "
        "Return ONLY valid JSON. The JSON schema should be: {\n  \"title\": string,\n  \"questions\": [\n    {\"question\": string, \"topic\": string, \"difficulty\": string}\n  ]\n}\n"
    )

    user_content = (
        f"Role: {spec.role or ''}\n"
        f"Experience: {spec.experience or ''}\n"
        f"Type: {spec.type or ''}\n"
        f"Difficulty: {spec.difficulty or ''}\n"
        f"Resume/Notes: {spec.resume or spec.notes or ''}\n"
    )

    try:
        completion = groq_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.2,
            max_tokens=800,
        )
        raw = completion.choices[0].message.content or ""
        # Try to extract JSON from the model output
        try:
            payload = json.loads(raw)
        except Exception:
            # Fallback: attempt to find the first JSON object in the string
            start = raw.find('{')
            end = raw.rfind('}')
            if start != -1 and end != -1 and end > start:
                snippet = raw[start:end+1]
                try:
                    payload = json.loads(snippet)
                except Exception:
                    payload = {"raw": raw}
            else:
                payload = {"raw": raw}

        return {"ok": True, "generated": payload}
    except Exception as e:
        return {"ok": False, "error": str(e)}
