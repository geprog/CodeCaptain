from typing import Union

from fastapi import FastAPI
from indexer import generate_index, update_index_with_issues

from models import Conversation, IndexInfo, IssueIndexInfo
from question import ask

app = FastAPI()


@app.get("/")
def heart_beat():
    return "welcome to dev addy chat server"

@app.post("/index")
def perform_index(indexInfo: IndexInfo):
    generate_index(indexInfo.repo_name)
    return indexInfo

@app.post("/ask")
def conversation(conversationInput: Conversation):
    conversationInput.answer, conversationInput.chat_history = ask(conversationInput.repo_name, conversationInput.question, conversationInput.chat_history)
    return conversationInput

@app.post("/index-issue")
def perform_issue_index(indexInfo: IssueIndexInfo):
    update_index_with_issues(indexInfo.repo_path, indexInfo.issue_file_name)
    return "success"