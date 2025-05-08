from fastapi import FastAPI
import requests
from typing import Dict


app = FastAPI()

@app.post("/api/chat/chatbot")
async def chatbot(data: Dict[str, str]):
    user_message = data.get("message", "")
    session_id = data.get("session_id", "default")

    # Gọi MCP server
    response = requests.post(
        "http://localhost:8001/mcp/query",
        json={"user_id": session_id, "query": user_message}
    ).json()

    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)