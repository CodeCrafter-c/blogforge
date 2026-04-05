import json
import asyncio
from typing import AsyncGenerator
from services.blog.queue_registry import get_queue


async def emit(blog_id: str, event: str, data: dict):
    queue = get_queue(blog_id)
    if queue:
        await queue.put({"event": event, "data": data})


async def sse_stream(queue: asyncio.Queue) -> AsyncGenerator[str, None]:
    yield ": connected\n\n"
    while True:
        try:
            item = await asyncio.wait_for(queue.get(), timeout=30)

            if item is None:
                yield "event: done\ndata: {}\n\n"
                break

            event = item.get("event", "message")
            data = json.dumps(item.get("data", {}))
            yield f"event: {event}\ndata: {data}\n\n"

        except asyncio.TimeoutError:
            yield ": ping\n\n"


EVENTS = {
    "ROUTER_START":   "router_start",
    "ROUTER_DONE":    "router_done",
    "RESEARCH_START": "research_start",
    "RESEARCH_DONE":  "research_done",
    "PLAN_START":     "plan_start",
    "PLAN_READY":     "plan_ready",
    "PLAN_APPROVED":  "plan_approved",
    "WRITING_START":  "writing_start",
    "SECTION_DONE":   "section_done",
    "CRITIC_START":   "critic_start",
    "DRAFT_READY":    "draft_ready",
    "DRAFT_APPROVED": "draft_approved",
    "SAVING":         "saving",
    "DONE":           "done",
    "ERROR":          "error",
}