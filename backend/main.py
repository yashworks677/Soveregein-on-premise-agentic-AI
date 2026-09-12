from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat(req: ChatRequest):
    return {"response": f"Echo: {req.message}"}