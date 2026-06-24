import chromadb

chroma_client = chromadb.PersistentClient(path="./rag/chroma_db")
collection = chroma_client.get_or_create_collection(name="marketlens_docs")