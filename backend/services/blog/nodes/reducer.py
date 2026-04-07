# reducer.py
from pathlib import Path
from services.blog.states import State
from datetime import datetime, timezone
from core.connection import get_db
from bson import ObjectId
from services.blog.sse import emit, EVENTS


async def reducer(state: State) -> dict:
    blog_id = state.get("blog_id")
    plan = state["plan"]

    await emit(blog_id, EVENTS["SAVING"], {
        "message": "📝 Assembling final blog...",
    })

    ordered_sections = [
        md for _, md in sorted(state.get("sections", []), key=lambda x: x[0])
    ]

    body = "\n\n".join(ordered_sections).strip()
    final_md = f"# {plan.blog_title}\n\n{body}\n"

    Path(f"{plan.blog_title}.md").write_text(final_md, encoding="utf-8")

    sources = [e.url for e in state.get("evidence", []) if e.url]

    if blog_id:
        try:
            obj_id = ObjectId(blog_id)
        except Exception:
            obj_id = blog_id

        db = get_db()
        await db["blogs"].update_one(
            {"_id": obj_id},
            {"$set": {
                "content": final_md,
                "blog_title": plan.blog_title,
                "plan": plan.model_dump(),
                "sources": sources,
                "status": "awaiting_draft_approval",
                "updated_at": datetime.now(timezone.utc),
            }}
        )

    await emit(blog_id, EVENTS["DRAFT_READY"], {
        "message": "⏸️ Draft ready — review and approve to finalize.",
        "blog_id": blog_id,
        "blog_title": plan.blog_title,
        "content": final_md,
        "sources": sources,
    })

    return {"final": final_md}
async def finalize_node(state: State) -> dict:
    blog_id = state.get("blog_id")

    db = get_db()
    await db["blogs"].update_one(
        {"_id": ObjectId(blog_id)},
        {"$set": {
            "status": "completed",
            "updated_at": datetime.now(timezone.utc),
        }}
    )

    await emit(blog_id, EVENTS["DONE"], {
        "message": "🎉 Blog generated and saved!",
        "blog_id": blog_id,
    })

    # ✅ look up queue from registry to send the sentinel
    from services.blog.queue_registry import get_queue
    queue = get_queue(blog_id)
    if queue:
        await queue.put(None)

    return {}

def route_after_draft(state: State) -> str:
    # ✅ FIXED: return values now match graph edge keys ("finalize" / "orchestrator")
    if state.get("draft_approved"):
        return "finalize"
    return "orchestrator"