from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from chromadb.utils import embedding_functions 
from pydantic import BaseModel

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize embedder
embedder = embedding_functions.DefaultEmbeddingFunction()

# Request models
class TextInput(BaseModel):
    text: str

class TextPairInput(BaseModel):
    text1: str
    text2: str

# Endpoint to get embedding vector
@app.post("/api/embed")
async def embed_text(input_data: TextInput):
    """Accept a string and return its embedded vector as a list"""
    embedding = embedder([input_data.text])[0]
    return {"vector": embedding.tolist()}

# Cosine similarity helper
def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(vec1, vec2) / (norm1 * norm2))

# Endpoint to embed two texts and return similarity
@app.post("/api/embed-pair")
async def embed_pair(input_data: TextPairInput):
    """Accept two strings and return both embeddings plus their cosine similarity"""
    embeddings = embedder([input_data.text1, input_data.text2])
    vec1 = np.array(embeddings[0])
    vec2 = np.array(embeddings[1])
    similarity = cosine_similarity(vec1, vec2)
    return {
        "vector1": vec1.tolist(),
        "vector2": vec2.tolist(),
        "cosine_similarity": similarity,
    }

app.mount("/", StaticFiles(directory="static", html=True), name="static")

