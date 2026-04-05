"""Run this to verify your Groq API key works.
Usage: python test_groq.py
"""
import asyncio
from groq import AsyncGroq
from dotenv import load_dotenv
import os

load_dotenv()

async def main():
    key = os.getenv("GROQ_API_KEY", "")
    if not key:
        print("ERROR: GROQ_API_KEY not set in .env")
        return

    print(f"Key found: {key[:10]}...")
    client = AsyncGroq(api_key=key)

    print("Sending test message to Groq...")
    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=64,
        messages=[{"role": "user", "content": "Reply with: API key works!"}],
    )
    print("Response:", response.choices[0].message.content)

asyncio.run(main())
