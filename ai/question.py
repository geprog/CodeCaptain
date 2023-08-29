import os
import sys
import time
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ChatMessageHistory
from langchain.chat_models import ChatOpenAI
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

data_path = os.getenv("DATA_PATH")

chats = {}


def ask(repo_id: int, question: str, chat_history=[]):
    history = ChatMessageHistory()

    embeddings = OpenAIEmbeddings(disallowed_special=())

    repo_path = os.path.join(data_path, str(repo_id))

    db = FAISS.load_local(os.path.join(repo_path, "vector_store"), embeddings)

    retriever = db.as_retriever()
    end = time.time()

    retriever.search_kwargs["distance_metric"] = "cos"
    retriever.search_kwargs["fetch_k"] = 100
    retriever.search_kwargs["maximal_marginal_relevance"] = True
    retriever.search_kwargs["k"] = 20

    template = """You are a chatbot having a conversation with a human.

    Given the following extracted parts of a long document and a question, create a final answer.

    {context}

    {chat_history}
    Human: {human_input}
    Chatbot:"""

    prompt = PromptTemplate(
        input_variables=["chat_history", "human_input", "context"], template=template
    )
    memory = ConversationBufferMemory(
        memory_key="chat_history", input_key="human_input"
    )
    chain = load_qa_chain(
        OpenAI(temperature=0), chain_type="stuff", memory=memory, prompt=prompt
    )

    model = ChatOpenAI(model_name="gpt-3.5-turbo-16k")
    qa = ConversationalRetrievalChain.from_llm(model, retriever=retriever)
    end = time.time()

    chat_history = []
    result = qa({"question": question, "chat_history": chat_history})
    chat_history.append((question, result["answer"]))
    return result["answer"], chat_history

    end = time.time()


def closeChat(repo_id: int):
    pass
    #  delete chats[repo_id]


if __name__ == "__main__":
    # print(f">>>{sys.argv}<<<\n")
    ask(sys.argv[1], sys.argv[2])
