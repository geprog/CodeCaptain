from pydantic import BaseModel
from typing import Tuple


class IndexInfo(BaseModel):
    repo_name: str

class IssueIndexInfo(BaseModel):
    repo_path: str
    issue_file_name: str
class Conversation(BaseModel):
    repo_name: str
    question: str
    answer = ''
    chat_history: Tuple[(str,str)] = []