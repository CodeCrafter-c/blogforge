from fastapi import APIRouter, HTTPException, Depends,Request
from fastapi.responses import StreamingResponse
from middlewares.auth import auth
from core.connection import get_db
from schemas.blog import CreateBlogRequest, ApprovePlanRequest, ApproveDraftRequest, SendMessageRequest
from services.blog.blog_pipeline import pipeline
from services.blog.sse import sse_stream, emit, EVENTS
from services.blog.states import State
from services.blog.queue_registry import register_queue, get_queue, unregister_queue
from datetime import datetime, timezone
import bson
import asyncio

blog_router = APIRouter()


@blog_router.post("/create")
async def create_blog(data: CreateBlogRequest, user_id: str = Depends(auth)):
    db = get_db()
    result = await db["blogs"].insert_one({
        "user_id": user_id,
        "topic": data.topic,
        "status": "idle",
        "mode": None,
        "blog_title": None,
        "plan": None,
        "content": None,
        "sources": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    })
    blog_id = str(result.inserted_id)
    return {"blog_id": blog_id, "message": "Blog created"}


@blog_router.get("/generate/{blog_id}")
async def generate_blog(blog_id: str,request:Request, user_id: str = Depends(auth)):
    existing_queue = get_queue(blog_id)
    
    if existing_queue:
        return StreamingResponse(
            sse_stream(existing_queue),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
        )
    
    
    
    
    db = get_db()
    blog = await db["blogs"].find_one({
        "_id": bson.ObjectId(blog_id), "user_id": user_id
    })
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    await db["blogs"].update_one(
        {"_id": bson.ObjectId(blog_id)},
        {"$set": {"status": "generating", "updated_at": datetime.now(timezone.utc)}}
    )

    queue = asyncio.Queue()
    register_queue(blog_id, queue)
    await queue.put({
    "event": "connected",
    "data": {"message": "SSE started"}
    })
    
    
    
    async def run_pipeline():
        try:
            config = {"configurable": {"thread_id": blog_id}}
            existing = await pipeline.aget_state(config)
            print(f"🔍 Existing checkpoint for {blog_id}: {existing.values if existing else 'NONE'}")
            print(f"🔍 Existing next: {existing.next if existing else 'NONE'}")
        
            
            initial_state: State = {
                "topic": blog["topic"],
                "blog_id": blog_id,
                "mode": "",
                "needs_research": False,
                "queries": [],
                "reasoning": "",
                "evidence": [],
                "plan": None,
                "plan_approved": False,
                "plan_feedback": None,
                "draft_approved": False,
                "draft_feedback": None,
                "sections": [],
                "final": "",
            }
            await pipeline.ainvoke(initial_state, config=config)
        except Exception as e:
            await emit(blog_id, EVENTS["ERROR"], {"message": str(e)})
            q = get_queue(blog_id)  # ✅ no variable shadowing
            if q:
                await q.put(None)
        # ✅ NO finally/unregister here — queue must stay alive across interrupts
        # unregister_queue is called inside finalize_node after the sentinel is sent

    asyncio.create_task(run_pipeline())
    return StreamingResponse(
        sse_stream(queue),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )

# api.py — add this route BEFORE /{blog_id}
@blog_router.get("/stream/{blog_id}")
async def stream_blog(blog_id: str, user_id: str = Depends(auth)):
    """Reconnect to existing in-progress pipeline after HITL approval."""
    queue = get_queue(blog_id)
    if not queue:
        raise HTTPException(status_code=404, detail="No active stream for this blog")

    return StreamingResponse(
        sse_stream(queue),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )

@blog_router.post("/approve-plan")
async def approve_plan(data: ApprovePlanRequest, user_id: str = Depends(auth)):
    db = get_db()
    blog = await db["blogs"].find_one({
        "_id": bson.ObjectId(data.blog_id), "user_id": user_id
    })
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    config = {"configurable": {"thread_id": data.blog_id}}

    await pipeline.aupdate_state(config, {
        "plan_approved": data.approved,
        "plan_feedback": data.feedback if not data.approved else None,
        "sections": [],
    })

    # ✅ small delay before creating task so state write is flushed
    async def resume():
        await asyncio.sleep(0.1)  # let aupdate_state fully commit
        await pipeline.ainvoke(None, config=config)

    asyncio.create_task(resume())
    return {"message": "Plan approved, writing sections..." if data.approved else "Re-planning..."}


@blog_router.post("/approve-draft")
async def approve_draft(data: ApproveDraftRequest, user_id: str = Depends(auth)):
    db = get_db()
    blog = await db["blogs"].find_one({
        "_id": bson.ObjectId(data.blog_id), "user_id": user_id
    })
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    config = {"configurable": {"thread_id": data.blog_id}}

    await pipeline.aupdate_state(config, {
        "draft_approved": data.approved,
        "draft_feedback": data.Feedback if not data.approved else None,  # ✅ capital F
    })

    async def resume():
        await asyncio.sleep(0.1)
        await pipeline.ainvoke(None, config=config)

    asyncio.create_task(resume())
    return {"message": "Draft approved!" if data.approved else "Re-generating with feedback..."}

@blog_router.get("/history")
async def get_history(user_id: str = Depends(auth)):
    db = get_db()
    blogs = await db["blogs"].find(
        {"user_id": user_id},
        {"content": 0, "plan": 0}
    ).sort("created_at", -1).to_list(50)

    for b in blogs:
        b["_id"] = str(b["_id"])

    return {"blogs": blogs}


@blog_router.get("/{blog_id}")
async def get_blog(blog_id: str, user_id: str = Depends(auth)):
    db = get_db()
    blog = await db["blogs"].find_one({
        "_id": bson.ObjectId(blog_id),
        "user_id": user_id
    })
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    blog["_id"] = str(blog["_id"])
    return blog


@blog_router.delete("/{blog_id}")
async def delete_blog(blog_id: str, user_id: str = Depends(auth)):
    db = get_db()
    result = await db["blogs"].delete_one({
        "_id": bson.ObjectId(blog_id),
        "user_id": user_id
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")

    await db["messages"].delete_many({"blog_id": blog_id})
    return {"message": "Blog deleted"}


@blog_router.post("/{blog_id}/message")
async def send_message(blog_id: str, data: SendMessageRequest, user_id: str = Depends(auth)):
    db = get_db()
    blog = await db["blogs"].find_one({
        "_id": bson.ObjectId(blog_id),
        "user_id": user_id
    })
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    await db["messages"].insert_one({
        "blog_id": blog_id,
        "user_id": user_id,
        "role": "user",
        "type": data.type,
        "content": data.content,
        "created_at": datetime.now(timezone.utc),  # ✅ fixed deprecated utcnow()
    })

    if data.type == "publish_twitter":
        from services.twitter import post_to_twitter
        tweet_url = await post_to_twitter(blog["content"])
        await db["messages"].insert_one({
            "blog_id": blog_id,
            "user_id": user_id,
            "role": "assistant",
            "type": "publish_twitter",
            "content": f"Posted to Twitter: {tweet_url}",
            "metadata": {"tweet_url": tweet_url},
            "created_at": datetime.now(timezone.utc),  # ✅ fixed
        })
        return {"message": "Posted to Twitter", "tweet_url": tweet_url}

    return {"message": "Message received"}


@blog_router.get("/{blog_id}/messages")
async def get_messages(blog_id: str, user_id: str = Depends(auth)):
    db = get_db()
    messages = await db["messages"].find(
        {"blog_id": blog_id, "user_id": user_id}
    ).sort("created_at", 1).to_list(100)

    for m in messages:
        m["_id"] = str(m["_id"])

    return {"messages": messages}