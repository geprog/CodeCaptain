from pydantic import BaseModel
from typing import List, Tuple


class IndexInfo(BaseModel):
    repo_id: str


class IssueIndexInfo(BaseModel):
    repo_path: str
    issue_file_names: List[str]


class Conversation(BaseModel):
    repo_id: str
    question: str
    answer = ""
    chat_history: Tuple[(str, str)] = []
