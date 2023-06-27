import os
from langchain.document_loaders import TextLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import DeepLake
from dotenv import load_dotenv
from langchain.text_splitter import CharacterTextSplitter

load_dotenv()

def main():
  embeddings = OpenAIEmbeddings(disallowed_special=())

  root_dir = './repos/kiel-live'
  docs = []
  for dirpath, dirnames, filenames in os.walk(root_dir):
      for file in filenames:
          try:
              loader = TextLoader(os.path.join(dirpath, file), encoding='utf-8')
              docs.extend(loader.load_and_split())
          except Exception as e:
              pass

  text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
  texts = text_splitter.split_documents(docs)
  username = "anbraten"
  db = DeepLake(dataset_path=f"hub://{username}/dev-addy", embedding_function=embeddings)  # dataset would be publicly available
  db.add_documents(texts)
  print("done")

if __name__ == '__main__':
    main()
