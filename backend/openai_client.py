# import os
# from typing import Optional

# import requests

# from backend.config import Config

# SAMBA_API_URL = "https://api.sambanova.ai/v1/chat/completions"
# DEFAULT_MODEL = "Meta-Llama-3.1-70B-Instruct"


# def _get_api_key() -> Optional[str]:
#     return os.getenv("SAMBANOVA_API_KEY") or Config.SAMBANOVA_API_KEY


# def generate_completion(prompt: str, model: str = DEFAULT_MODEL, max_tokens: int = 512) -> str:
#     """Generate text using SambaNova's API (OpenAI-compatible schema)."""
#     api_key = _get_api_key()
#     if not api_key:
#         raise RuntimeError("SambaNova API key not configured (SAMBANOVA_API_KEY)")

#     payload = {
#         "model": model,
#         "messages": [{"role": "user", "content": prompt}],
#         "max_tokens": max_tokens,
#     }
#     headers = {
#         "Authorization": f"Bearer {api_key}",
#         "Content-Type": "application/json",
#     }
#     resp = requests.post(SAMBA_API_URL, json=payload, headers=headers, timeout=30)
#     resp.raise_for_status()
#     data = resp.json()
#     try:
#         return data["choices"][0]["message"]["content"].strip()
#     except Exception as exc:
#         raise RuntimeError(f"Unexpected SambaNova response: {data}") from exc
import os
from groq import Groq
from backend.config import Config

client = Groq(
    api_key=os.getenv("GROQ_API_KEY") or Config.GROQ_API_KEY
)

# ✅ ACTIVE MODEL
MODEL = "llama-3.1-8b-instant"


def generate_completion(prompt: str, max_tokens: int = 512) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_tokens,
        temperature=0.7,
    )

    return response.choices[0].message.content.strip()
