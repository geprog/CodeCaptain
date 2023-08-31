import logging
import os
import time
import sys
import meta_information
from langchain.document_loaders import TextLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


data_path = os.getenv("DATA_PATH")


def generate_index(repo_id: int):
    repo_path = os.path.join(data_path, str(repo_id))

    docs = []
    
    print('starting repo embedding...')
    # index repo
    for dirpath, _, filenames in os.walk(os.path.join(repo_path, "repo")):
        for file in filenames:
            try:
                loader = TextLoader(os.path.join(dirpath, file), encoding="utf-8")
                docs.extend(loader.load_and_split())
            except Exception as e:
                pass
            
    print('finished repo embedding')

    # index file structure
    print('started generating meta information: file structure described as text')
    
    meta_information.generate_file_structure_description(repo_path)
    docs.extend(
        TextLoader(
            os.path.join(repo_path, "file-structure.txt"), encoding="utf-8"
        ).load_and_split()
    )
    print('generating meta information: file structure described as text')
   
    # index issues
    print('started embedding issues')
    for dirpath, _, filenames in os.walk(os.path.join(repo_path, "issues")):
        for file in filenames:
            try:
                loader = TextLoader(os.path.join(dirpath, file), encoding="utf-8")
                docs.extend(loader.load_and_split())
                time.sleep(5)
            except Exception as e:
                pass
            
    print('finished embedding issues')
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0, separators=[';', '/n','}'])
    docs = text_splitter.split_documents(docs)
    embeddingApi = OpenAIEmbeddings(chunk_size=1000)

    db = FAISS.from_documents(docs, embeddingApi)
    db.save_local(os.path.join(repo_path, "vector_store"))

    print("done")


if __name__ == "__main__":
    generate_index(sys.argv[1])
