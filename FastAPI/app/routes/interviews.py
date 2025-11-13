from typing import Optional, List
import json
import os
from pydantic import BaseModel
from fastapi import APIRouter

from ..services.groq_client import get_groq_client, GROQ_LLM_MODEL
from ..services.evaluation import evaluate_interview

router = APIRouter()


class InterviewSpec(BaseModel):
    title: Optional[str]
    role: Optional[str]
    difficulty: Optional[str]
    notes: Optional[str]


class EvaluationRequest(BaseModel):
    conversation: List[dict]  # List of {role: 'user'|'assistant', content: str}
    interviewContext: dict  # {role, difficulty, notes}


class TitleGenerationRequest(BaseModel):
    role: str
    difficulty: str
    notes: Optional[str] = ""


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
        "You are an expert interviewer generator. Given a job role and difficulty level, "
        "produce a JSON object with a concise title and an array of 6-10 interview questions "
        "appropriate to the role and difficulty. "
        "Return ONLY valid JSON. The JSON schema should be: {\n  \"title\": string,\n  \"questions\": [\n    {\"question\": string, \"topic\": string, \"difficulty\": string}\n  ]\n}\n"
    )

    user_content = (
        f"Role: {spec.role or ''}\n"
        f"Difficulty: {spec.difficulty or ''}\n"
        f"Notes: {spec.notes or ''}\n"
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


@router.post("/interviews/generate-title")
async def generate_interview_title(request: TitleGenerationRequest):
    """
    Generate a creative interview title based on role and difficulty
    """
    try:
        groq_client = get_groq_client()
        if not groq_client:
            return {"ok": False, "error": "GROQ_API_KEY not configured"}

        model = os.getenv("GROQ_LLM_MODEL", GROQ_LLM_MODEL)

        prompt = f"""Generate a professional, creative, and engaging interview title for:
Role: {request.role}
Difficulty: {request.difficulty}
{f'Notes: {request.notes}' if request.notes else ''}

Requirements:
- Keep it concise (3-6 words)
- Make it professional yet engaging
- Reflect the role and difficulty level
- No generic titles like "Software Engineer Interview"
- Be creative and specific

Return ONLY the title text, nothing else."""

        completion = groq_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an expert at creating engaging interview titles. Return only the title text."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            max_tokens=50,
        )
        
        title = completion.choices[0].message.content.strip()
        
        # Remove quotes if present
        title = title.strip('"').strip("'")
        
        return {"ok": True, "title": title}
    except Exception as e:
        # Fallback to simple title if LLM fails
        fallback_title = f"{request.role} - {request.difficulty} Interview"
        return {"ok": True, "title": fallback_title, "fallback": True}


@router.post("/interviews/evaluate")
async def evaluate_interview_endpoint(request: EvaluationRequest):
    """
    Evaluate an interview and return detailed scores and feedback
    """
    try:
        evaluation = evaluate_interview(
            request.conversation,
            request.interviewContext
        )
        return {"ok": True, "evaluation": evaluation}
    except Exception as e:
        return {"ok": False, "error": str(e)}
