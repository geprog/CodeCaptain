# Dev Addy

A dev advisor to ask about your code and project

## ToDo

- [ ] use CodeSplitter and code-detector to get code parts
- [ ] test with more questions
- [ ] add UI
- [ ] add more context to embeddings
  - [ ] filepath
  - [ ] summary
  - [ ] language of code
- [ ] try gpt-4 and system messages
- [ ] update embeddings on commits
- [ ] show related code parts in UI
- [ ] include issues and PRs and their comments into embeddings

## Appreciations

- https://hackernoon.com/reverse-engineering-reddits-source-code-with-langchain-and-gpt-4

## How to start the python server

Use the command `uvicorn pyserver:app --reload` to start the python server. It takes default port 8000.
