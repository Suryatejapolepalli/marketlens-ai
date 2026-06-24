from rag.embeddings import get_embedding
from rag.vector_store import collection

def add_documents(docs):
    for doc in docs:
        text = doc["text"]
        doc_id = doc["id"]
        metadata = doc.get("metadata", {})

        embedding = get_embedding(text)

        collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[text],
            metadatas=[metadata]
        )

def search_documents(query: str, ticker: str, n_results: int = 5):
    query_embedding = get_embedding(query)

    return collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where={"ticker": ticker.upper()},
        include=["documents", "metadatas", "distances"]
    )