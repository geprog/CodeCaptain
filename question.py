import os
import time
from langchain.document_loaders import TextLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import DeepLake
from dotenv import load_dotenv
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI

load_dotenv()

questions = [
       "What are collectors?", 
       "What are the names of the collectors?",
       "What does NewCollector do?",
       "Why do we need the collectors?",
       "How are the collectors used in the project?",
       "What impact will the code have if I change the function NewCollector?",
       "What is the installation process for this project?",
       "How is the app getting the KVG data",
       "Which code gets the KVG data?",
       "What is the flow of vehicle data collection?"
       
    ]

def conversation(repo_name, question, chat_history=[]):
    print("Loading the model...", repo_name , question);
    embeddings = OpenAIEmbeddings(disallowed_special=())

    repo_path = os.path.join('data', repo_name)

    db = DeepLake(
        dataset_path= os.path.join(repo_path,'vector_store'),
        read_only=True,
        embedding_function=embeddings,
    )
    retriever = db.as_retriever()
    end = time.time()
    
    retriever.search_kwargs["distance_metric"] = "cos"
    retriever.search_kwargs["fetch_k"] = 100

    retriever.search_kwargs["maximal_marginal_relevance"] = True
    retriever.search_kwargs["k"] = 10
    
    model = ChatOpenAI(
        model_name="gpt-3.5-turbo"
    )  # switch to gpt-3.5-turbo if you want
    qa = ConversationalRetrievalChain.from_llm(model, retriever=retriever)
    end = time.time()
    
    
    chat_history = []
    questions = question
    for question in questions:
        result = qa({"question": question, "chat_history": chat_history})
        chat_history.append((question, result["answer"]))
        print(f"-> **Question**: {question} \n")
        print(f"**Answer**: {result['answer']} \n")
    end = time.time()
    

if __name__ == "__main__":
    conversation('kiel-live',questions)
