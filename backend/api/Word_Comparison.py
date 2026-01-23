from sentence_transformers import SentenceTransformer
import numpy as np

# Global variable to store the loaded model
_model = None


def loadmodel():
    """Load the model once and cache it globally."""
    global _model
    if _model is None:
        print("Loading model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def compareVectors(sentence1, sentence2):
    """Compare two sentences using the loaded model."""
    model = loadmodel()

    # Generate the embeddings (vectors)
    embedding_1 = model.encode(sentence1)
    embedding_2 = model.encode(sentence2)

    # Calculate cosine similarity
    cosine_similarity = np.dot(embedding_1, embedding_2) / (
        np.linalg.norm(embedding_1) * np.linalg.norm(embedding_2)
    )
    return cosine_similarity
