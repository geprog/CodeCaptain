import os
from langchain.document_loaders import TextLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import DeepLake
from dotenv import load_dotenv
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI

load_dotenv()


def main():
    embeddings = OpenAIEmbeddings(disallowed_special=())

    username = "anbraten"
    db = DeepLake(
        dataset_path=f"hub://{username}/dev-addy",
        read_only=True,
        embedding_function=embeddings,
    )
    retriever = db.as_retriever()
    retriever.search_kwargs["distance_metric"] = "cos"
    retriever.search_kwargs["fetch_k"] = 100

    retriever.search_kwargs["maximal_marginal_relevance"] = True
    retriever.search_kwargs["k"] = 10

    model = ChatOpenAI(
        model_name="gpt-3.5-turbo"
    )  # switch to gpt-3.5-turbo if you want
    qa = ConversationalRetrievalChain.from_llm(model, retriever=retriever)

    questions = ["What are collectors?", "What are the names of the collectors?"]
    chat_history = []

    for question in questions:
        result = qa({"question": question, "chat_history": chat_history})
        chat_history.append((question, result["answer"]))
        print(f"-> **Question**: {question} \n")
        print(f"**Answer**: {result['answer']} \n")


if __name__ == "__main__":
    main()
