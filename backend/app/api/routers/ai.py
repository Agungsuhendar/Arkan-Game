import json
import urllib.request
import urllib.error
import asyncio
import logging
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from app.config import settings

router = APIRouter(prefix="/ai", tags=["ai"])
logger = logging.getLogger(__name__)

class AIAskRequest(BaseModel):
    question: str
    language: Optional[str] = "id-ID"

ARKAN_SYSTEM_PROMPT = (
    "Kamu adalah Arkan, seorang anak laki-laki berusia 7 tahun yang cerdas, ramah, dan penuh rasa ingin tahu. "
    "Tugasmu adalah menjawab pertanyaan anak-anak seputar sains, hewan, alam, luar angkasa, kesehatan, dan kehidupan sehari-hari. "
    "Aturan Jawaban: "
    "1. Berikan jawaban dalam Bahasa Indonesia yang sangat ramah anak dan mudah dipahami anak usia 4-9 tahun. "
    "2. Panjang jawaban maksimal 2-3 kalimat singkat yang jelas dan menarik. "
    "3. Selalu sertakan 1-2 emoji yang ceria dan sesuai. "
    "4. Gunakan nada bicara seperti teman dekat yang bersemangat!"
)

# Smart Knowledge Base Fallback when Gemini API key is offline/not configured
KID_KNOWLEDGE_BASE = [
    {
        "keywords": ["dinosaurus", "dino", "t-rex", "tyrannosaurus"],
        "answer": "Dinosaurus adalah hewan purba raksasa yang hidup jutaan tahun lalu! T-Rex punya gigi yang super tajam, sedangkan Brachiosaurus suka makan daun di pohon tinggi! 🦕🦖"
    },
    {
        "keywords": ["lautan", "laut", "samudra", "ikan", "hiu"],
        "answer": "Lautan adalah rumah bagi ribuan jenis ikan indah dan lumba-lumba pintar! Ikan bernapas di air menggunakan insang, hebat kan? 🌊🐠"
    },
    {
        "keywords": ["petir", "kilat", "guntur"],
        "answer": "Petir terjadi saat listrik alami di awan saling bergesekan saat hujan! Suaranya gelegar PHUAAR, tapi tenang saja, rumah kita aman! ⚡🌧️"
    },
    {
        "keywords": ["otak", "tubuh", "jantung", "darah"],
        "answer": "Tubuh kita punya jantung yang memompa darah dan otak yang menjadi komandan cerdas untuk berpikir dan belajar hal baru! 🧠❤️"
    },
    {
        "keywords": ["bulan", "malam", "bintang"],
        "answer": "Bulan menyinari malam hari dengan memantulkan cahaya dari matahari! Bentuknya bisa bulat penuh atau sabit indah di langit malam! 🌙⭐"
    },
    {
        "keywords": ["pohon", "daun", "oksigen", "tanaman"],
        "answer": "Pohon adalah pahlawan hijau bumi! Pohon menghirup udara kotor dan menghasilkan udara bersih segar bernama oksigen untuk kita bernapas! 🌳🍃"
    },
    {
        "keywords": ["robot", "teknologi", "komputer"],
        "answer": "Robot adalah mesin pintar buatan manusia yang bisa diprogram untuk membantu pekerjaan seperti menjelajah planet Mars! 🤖🚀"
    },
    {
        "keywords": ["hujan", "air", "awan"],
        "answer": "Hujan turun saat uap air laut naik menjadi awan tebal, lalu menjadi tetesan air yang menyejukkan bumi dan menyiram tanaman! 🌧️💧"
    }
]

def _sync_query_gemini(question: str, api_key: str) -> Optional[str]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{ARKAN_SYSTEM_PROMPT}\n\nPertanyaan anak: \"{question}\""}
                ]
            }
        ]
    }
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            if response.status == 200:
                body = response.read().decode("utf-8")
                res_json = json.loads(body)
                return res_json["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        logger.error(f"Gemini API urllib error: {e}")
        return None

async def query_gemini_api(question: str) -> Optional[str]:
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return None

    try:
        return await asyncio.to_thread(_sync_query_gemini, question, api_key)
    except Exception as e:
        logger.error(f"query_gemini_api thread error: {e}")
        return None

def fallback_kid_ai(question: str) -> str:
    lower_q = question.lower()
    for item in KID_KNOWLEDGE_BASE:
        if any(kw in lower_q for kw in item["keywords"]):
            return item["answer"]

    return (
        f"Pertanyaan yang super hebat tentang \"{question}\"! 🌟 "
        "Dunia ini penuh dengan keajaiban sains dan alam. "
        "Ayo kita jelajahi bersama Arkan melalui game dan petualangan seru! 🚀"
    )

from fastapi import APIRouter, HTTPException, Depends
from app.middleware.rate_limiter import ai_rate_limiter
from app.api.deps import get_current_user
from app.domain.models import User

@router.post("/ask", dependencies=[Depends(ai_rate_limiter)])
async def ask_arkan_ai(
    req: AIAskRequest,
    current_user: User = Depends(get_current_user)
):
    q = req.question.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Pertanyaan tidak boleh kosong.")

    # Try querying Gemini Generative AI first
    gemini_answer = await query_gemini_api(q)
    if gemini_answer:
        return {
            "question": q,
            "answer": gemini_answer,
            "source": "gemini_ai"
        }

    # Fallback to local Kid Knowledge Engine
    local_answer = fallback_kid_ai(q)
    return {
        "question": q,
        "answer": local_answer,
        "source": "arkan_knowledge_engine"
    }


