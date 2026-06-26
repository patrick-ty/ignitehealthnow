import vertexai
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel


class Embedder:
    DIMENSION = 768

    def __init__(self, project: str, location: str, model: str):
        vertexai.init(project=project, location=location)
        self._model = TextEmbeddingModel.from_pretrained(model)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        inputs = [TextEmbeddingInput(t, "RETRIEVAL_DOCUMENT") for t in texts]
        return [e.values for e in self._model.get_embeddings(inputs)]

    def embed_query(self, text: str) -> list[float]:
        inputs = [TextEmbeddingInput(text, "RETRIEVAL_QUERY")]
        return self._model.get_embeddings(inputs)[0].values
