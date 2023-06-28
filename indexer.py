import os
import time
import sys
from meta_information import generate_project_structure_description
from langchain.document_loaders import TextLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import DeepLake
from dotenv import load_dotenv
from langchain.text_splitter import CharacterTextSplitter


load_dotenv()


def generate_index(repo_name):
    generate_project_structure_description(
        f'./data/{repo_name}', './data/project-structures')
    start = time.time()
    embeddings = OpenAIEmbeddings(disallowed_special=())
    end = time.time()
    print('embedding generation took:', end - start)
    root_dir = f'./data/{repo_name}'
    docs = []
    docs.extend(TextLoader(
        f'./data/project-structures/{repo_name}.txt', encoding='utf-8').load_and_split())
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for file in filenames:
            try:
                loader = TextLoader(os.path.join(
                    dirpath, file), encoding='utf-8')
                docs.extend(loader.load_and_split())
            except Exception as e:
                pass

    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    texts = text_splitter.split_documents(docs)
    username = "anbraten"
    start = time.time()
    db = DeepLake(dataset_path=f"./data/my_data", embedding_function=embeddings,
                  overwrite=True)  # dataset would be publicly available
    db.add_documents(texts)
    end = time.time()

    print('deeplake instantiation and adding documents took: ', end - start)
    print("done")


if __name__ == '__main__':
    generate_index(sys.argv[1])
