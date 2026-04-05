import httpx
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Judge0 CE — free, no API key needed
JUDGE0_URL = "https://ce.judge0.com"

# Judge0 language IDs
LANG_MAP: dict[str, dict] = {
    "python":     {"id": 71,  "name": "Python (3.8.1)"},
    "javascript": {"id": 63,  "name": "JavaScript (Node.js 12.14.0)"},
    "typescript": {"id": 74,  "name": "TypeScript (3.7.4)"},
    "rust":       {"id": 73,  "name": "Rust (1.40.0)"},
    "go":         {"id": 60,  "name": "Go (1.13.5)"},
    "java":       {"id": 62,  "name": "Java (OpenJDK 13.0.1)"},
    "c":          {"id": 50,  "name": "C (GCC 9.2.0)"},
    "c++":        {"id": 54,  "name": "C++ (GCC 9.2.0)"},
    "cpp":        {"id": 54,  "name": "C++ (GCC 9.2.0)"},
    "bash":       {"id": 46,  "name": "Bash (5.0.0)"},
    "ruby":       {"id": 72,  "name": "Ruby (2.7.0)"},
    "php":        {"id": 68,  "name": "PHP (7.4.1)"},
    "swift":      {"id": 83,  "name": "Swift (5.2.3)"},
    "kotlin":     {"id": 78,  "name": "Kotlin (1.3.70)"},
    "scala":      {"id": 81,  "name": "Scala (2.13.2)"},
    "r":          {"id": 80,  "name": "R (4.0.0)"},
    "perl":       {"id": 85,  "name": "Perl (5.28.1)"},
    "lua":        {"id": 64,  "name": "Lua (5.3.5)"},
    "haskell":    {"id": 61,  "name": "Haskell (GHC 8.8.1)"},
    "elixir":     {"id": 57,  "name": "Elixir (1.9.4)"},
    "erlang":     {"id": 58,  "name": "Erlang (OTP 22.2)"},
}

# Judge0 status IDs
STATUS_MAP = {
    1: "In Queue", 2: "Processing", 3: "Accepted",
    4: "Wrong Answer", 5: "Time Limit Exceeded",
    6: "Compilation Error", 7: "Runtime Error (SIGSEGV)",
    8: "Runtime Error (SIGXFSZ)", 9: "Runtime Error (SIGFPE)",
    10: "Runtime Error (SIGABRT)", 11: "Runtime Error (NZEC)",
    12: "Runtime Error (Other)", 13: "Internal Error",
    14: "Exec Format Error",
}


class RunRequest(BaseModel):
    code: str
    language: str
    filename: str = "main"


class RunResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    language: str
    version: str


@router.post("/run", response_model=RunResponse)
async def run_code(body: RunRequest):
    import base64

    lang_key = body.language.lower()
    lang_info = LANG_MAP.get(lang_key)

    if not lang_info:
        return RunResponse(
            stdout="",
            stderr=f"Language '{body.language}' is not supported.",
            exit_code=1,
            language=body.language,
            version="",
        )

    headers = {"Content-Type": "application/json"}

    # submit
    payload = {
        "language_id": lang_info["id"],
        "source_code": base64.b64encode(body.code.encode()).decode(),
        "stdin": "",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        sub = await client.post(
            f"{JUDGE0_URL}/submissions?base64_encoded=true&wait=true",
            json=payload,
            headers=headers,
        )
        sub.raise_for_status()
        data = sub.json()

    def decode(val: str | None) -> str:
        if not val:
            return ""
        try:
            return base64.b64decode(val).decode("utf-8", errors="replace")
        except Exception:
            return val

    stdout = decode(data.get("stdout"))
    stderr = decode(data.get("stderr")) or decode(data.get("compile_output"))
    exit_code = data.get("exit_code") or 0
    status_id = data.get("status", {}).get("id", 3)

    # non-accepted statuses should surface as stderr
    if status_id not in (3,) and not stderr:
        stderr = STATUS_MAP.get(status_id, "Unknown error")

    if status_id != 3:
        exit_code = 1

    return RunResponse(
        stdout=stdout,
        stderr=stderr,
        exit_code=exit_code,
        language=lang_info["name"],
        version="",
    )
