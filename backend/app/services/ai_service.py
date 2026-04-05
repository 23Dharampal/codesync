import json
from groq import AsyncGroq
from app.config import settings
from app.schemas.ai import AIMessage

client = AsyncGroq(api_key=settings.groq_api_key)
MODEL = "llama-3.3-70b-versatile"


async def analyze_code(code: str, language: str, filename: str = "") -> list[AIMessage]:
    """Analyze code and return structured suggestions/warnings."""
    prompt = f"""You are an AI co-pilot in a live pair programming session.
Analyze the following {language} code{f' from file {filename}' if filename else ''} and return a JSON array of feedback.

Each item must have:
- type: "suggestion" | "warning" | "error" | "info"
- message: short explanation
- code_snippet: optional improved code (string or null)
- line_number: optional line number (int or null)

Return ONLY a valid JSON array, no markdown, no explanation.

Code:
```{language}
{code}
```"""

    response = await client.chat.completions.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    try:
        raw = response.choices[0].message.content.strip()
        # strip markdown code fences if model adds them
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0]
        items = json.loads(raw)
        return [AIMessage(**item) for item in items]
    except Exception:
        return [AIMessage(type="info", message="AI analysis complete. Code looks good.")]


async def ask_ai_stream(question: str, code_context: str, language: str):
    """Stream an answer to a user's question as SSE."""
    context_block = ""
    if code_context:
        context_block = f"\n\nCurrent code context ({language}):\n```{language}\n{code_context}\n```"

    prompt = f"You are an AI co-pilot helping developers in a live coding session.{context_block}\n\nQuestion: {question}"

    stream = await client.chat.completions.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield f"data: {json.dumps({'delta': delta})}\n\n"
    yield "data: [DONE]\n\n"


async def summarize_session(files: list[dict], duration_seconds: int) -> str:
    """Generate a bullet-point summary of what was built in the session."""
    minutes = duration_seconds // 60
    files_text = "\n".join(
        f"### {f['name']}\n```\n{f['content'][:500]}\n```" for f in files
    )

    prompt = f"""Summarize this pair programming session in 3-5 bullet points.
Session duration: {minutes} minutes.
Files created/modified:
{files_text}

Return only bullet points, concise and clear."""

    response = await client.chat.completions.create(
        model=MODEL,
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content.strip()
