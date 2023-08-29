from pydantic import BaseModel
from typing import List, Tuple


class IndexInfo(BaseModel):
    repo_id: int


class IssueIndexInfo(BaseModel):
    repo_path: str
    issue_file_names: List[str]


class Conversation(BaseModel):
    repo_id: int
    question: str
    answer: str = ""
    chat_history: Tuple[(str, str)] = []
