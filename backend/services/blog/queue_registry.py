# services/blog/queue_registry.py
import asyncio

_registry: dict[str, asyncio.Queue] = {}

def register_queue(blog_id: str, queue: asyncio.Queue):
    _registry[blog_id] = queue

def get_queue(blog_id: str) -> asyncio.Queue | None:
    return _registry.get(blog_id)

def unregister_queue(blog_id: str):
    _registry.pop(blog_id, None)