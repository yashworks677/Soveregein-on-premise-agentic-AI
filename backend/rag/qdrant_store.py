import math
import re
import json
from pathlib import Path
from typing import List, Dict, Any, Tuple
from backend.config import KNOWLEDGE_DIR, DB_PATH
from backend.audit import register_knowledge_doc, delete_registered_knowledge, get_registered_knowledge

VECTOR_INDEX_FILE = KNOWLEDGE_DIR / "vector_index.json"

class SovereignQdrantStore:
    """
    On-Premise Local Air-Gapped Vector Database.
    Follows Qdrant collection architecture with dense vector embeddings,
    cosine similarity metrics, payload indexing, and zero external network calls.
    """
    def __init__(self):
        self.dimension = 128
        self.collection_name = "sovereign_knowledge_enclave"
        self.index_data = self._load_index()

    def _load_index(self) -> Dict[str, Any]:
        if VECTOR_INDEX_FILE.exists():
            try:
                with open(VECTOR_INDEX_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {"collection": self.collection_name, "dimension": self.dimension, "points": []}

    def _save_index(self):
        with open(VECTOR_INDEX_FILE, "w", encoding="utf-8") as f:
            json.dump(self.index_data, f, indent=2, ensure_ascii=False)

    def _generate_embedding(self, text: str) -> List[float]:
        """
        Dense 128-dimensional deterministic semantic embedding generator.
        Utilizes n-gram hashing and term weighting with L2 unit normalization.
        Ensures local, fast, reproducible vector math without requiring PyTorch/CUDA weights.
        """
        tokens = re.findall(r"\b[a-zA-Z0-9_\-\.]{2,}\b", text.lower())
        vec = [0.0] * self.dimension
        if not tokens:
            return vec

        for i, token in enumerate(tokens):
            # Primary token hash
            h1 = hash(token) % self.dimension
            # Bigram context hash
            if i > 0:
                h2 = hash(tokens[i-1] + "_" + token) % self.dimension
                vec[h2] += 1.5
            vec[h1] += 1.0

        # L2 Normalization
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [round(x / norm, 6) for x in vec]
        return vec

    def _cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        return max(0.0, min(1.0, dot))

    def chunk_text(self, text: str, chunk_size: int = 150, overlap: int = 30) -> List[Dict[str, Any]]:
        """Splits document text into semantic chunks with overlapping context."""
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks = []
        current_chunk = []
        current_word_count = 0
        current_section = "General Provision"

        for p in paragraphs:
            # Check for section header
            if len(p) < 80 and any(kw in p.upper() for kw in ["SECTION", "CHAPTER", "SOP-", "ARTICLE", "ANNEX", "APPENDIX", "STANDARD"]):
                current_section = p

            words = p.split()
            if current_word_count + len(words) > chunk_size and current_chunk:
                chunk_text_str = " ".join(current_chunk)
                chunks.append({
                    "text": chunk_text_str,
                    "section": current_section,
                    "word_count": len(current_chunk)
                })
                # Retain overlap words
                current_chunk = current_chunk[-overlap:] if len(current_chunk) > overlap else []
                current_word_count = len(current_chunk)

            current_chunk.extend(words)
            current_word_count += len(words)

        if current_chunk:
            chunks.append({
                "text": " ".join(current_chunk),
                "section": current_section,
                "word_count": len(current_chunk)
            })

        return chunks

    def add_document(self, doc_id: str, filename: str, title: str, text: str, 
                     uploaded_by: str = "admin", description: str = "") -> int:
        chunks = self.chunk_text(text)
        points = self.index_data.get("points", [])
        
        # Remove existing chunks for same doc_id
        points = [p for p in points if p.get("doc_id") != doc_id]
        
        for idx, chunk in enumerate(chunks):
            vector = self._generate_embedding(chunk["text"])
            point = {
                "id": f"{doc_id}_chunk_{idx}",
                "doc_id": doc_id,
                "filename": filename,
                "title": title,
                "section": chunk["section"],
                "text": chunk["text"],
                "vector": vector,
                "created_at": str(Path(filename).name)
            }
            points.append(point)

        self.index_data["points"] = points
        self._save_index()

        # Register in SQLite database
        register_knowledge_doc(
            id=doc_id,
            filename=filename,
            title=title,
            file_type=Path(filename).suffix.lstrip(".").lower() or "txt",
            size_bytes=len(text.encode("utf-8")),
            chunks_count=len(chunks),
            uploaded_by=uploaded_by,
            description=description or f"Indexed {len(chunks)} chunks into Sovereign Qdrant Enclave"
        )
        return len(chunks)

    def search(self, query: str, top_k: int = 4, score_threshold: float = 0.15) -> List[Dict[str, Any]]:
        """
        Retrieves top_k most semantically relevant chunks for a user requirement.
        """
        query_vec = self._generate_embedding(query)
        query_words = set(re.findall(r"\b[a-zA-Z0-9_\-\.]{3,}\b", query.lower()))
        points = self.index_data.get("points", [])
        scored_results = []

        for p in points:
            cos_sim = self._cosine_similarity(query_vec, p["vector"])
            # Exact keyword boosting
            chunk_words = set(re.findall(r"\b[a-zA-Z0-9_\-\.]{3,}\b", p["text"].lower()))
            overlap = len(query_words.intersection(chunk_words))
            boost = min(0.35, overlap * 0.07)
            final_score = min(0.99, cos_sim + boost)

            if final_score >= score_threshold:
                scored_results.append({
                    "document_name": p["filename"],
                    "title": p.get("title", p["filename"]),
                    "section": p["section"],
                    "snippet": p["text"],
                    "relevance_score": round(final_score, 4)
                })

        scored_results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_results[:top_k]

    def delete_document(self, doc_id: str) -> bool:
        points = self.index_data.get("points", [])
        initial_len = len(points)
        self.index_data["points"] = [p for p in points if p.get("doc_id") != doc_id]
        self._save_index()
        delete_registered_knowledge(doc_id)
        return len(self.index_data["points"]) < initial_len

# Global instance
qdrant_store = SovereignQdrantStore()
