# Dev Addy

A dev advisor to ask about your code and project

## How to start the python server

Use the command `uvicorn pyserver:app --reload` to start the python server. It takes default port 8000.

If it doesn't work try `python -m uvicorn main:app --reload` (windows users).

## ToDo

- [ ] use CodeSplitter and code-detector to get code parts
- [x] test with more questions
- [x] add UI
- [ ] add more context / data to embeddings
  - [x] file structure
  - [ ] summary
  - [ ] language of code
  - [x] include issues
  - [ ] include PRs
  - [ ] include issue comments
  - [ ] include PR comments
- [ ] try gpt-4 and system messages
- [ ] update embeddings on commits
- [ ] show related code parts in UI

## Appreciations

- https://hackernoon.com/reverse-engineering-reddits-source-code-with-langchain-and-gpt-4

