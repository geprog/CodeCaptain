import os
from typing import Union
from fastapi import FastAPI
from indexer import generate_index
from models import Conversation, IndexInfo, IssueIndexInfo
from question import ask
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI()


@app.get("/")
def heart_beat():
    return "welcome to codecaptain ai server"


@app.post("/index")
def perform_index(indexInfo: IndexInfo):
    generate_index(indexInfo.repo_name)
    return indexInfo


@app.post("/ask")
def conversation(conversationInput: Conversation):
    conversationInput.answer, conversationInput.chat_history = ask(
        conversationInput.repo_name,
        conversationInput.question,
        conversationInput.chat_history,
    )
    return conversationInput
