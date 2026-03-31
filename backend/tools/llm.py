from langchain_ollama import ChatOllama
from core.config import settings

llm = ChatOllama(model=settings.LLM)