# test_graph.py
import asyncio
from bson import ObjectId
from services.blog.states import State
from services.blog.blog_pipeline import pipeline
from services.blog.queue_registry import register_queue, unregister_queue
from core.connection import get_db,connect_to_mongo
from core.config import settings
async def test():
    await(connect_to_mongo(settings.MONGO_URI))
    print("connected tp db")
    # ✅ create a real blog in DB first
    db = get_db()
    result = await db["blogs"].insert_one({
        "user_id": "test-user",
        "topic": "How Python async works",
        "status": "idle",
        "mode": None,
        "blog_title": None,
        "plan": None,
        "content": None,
        "sources": [],
    })
    blog_id = str(result.inserted_id)
    print(f"✅ Created blog: {blog_id}")

    queue = asyncio.Queue()
    register_queue(blog_id, queue)

    config = {"configurable": {"thread_id": blog_id}}
    initial_state: State = {
        "blog_id": blog_id,
        "topic": "How Python async works",
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

    print("\n▶ Starting pipeline...")
    await pipeline.ainvoke(initial_state, config=config)

    print("\n📨 Events emitted:")
    while not queue.empty():
        item = queue.get_nowait()
        print(f"  [{item['event']}] {item['data'].get('message', '')}")

    state = await pipeline.aget_state(config)
    print(f"\n⏸ Interrupted at: {state.next}")

    # ✅ simulate plan approval
    print("\n✅ Approving plan...")
    await pipeline.aupdate_state(config, {
        "plan_approved": True,
        "sections": [],
    })
    await pipeline.ainvoke(None, config=config)

    print("\n📨 Events after plan approval:")
    while not queue.empty():
        item = queue.get_nowait()
        print(f"  [{item['event']}] {item['data'].get('message', '')}")

    state = await pipeline.aget_state(config)
    print(f"\n⏸ Interrupted at: {state.next}")

    # ✅ simulate draft approval
    print("\n✅ Approving draft...")
    await pipeline.aupdate_state(config, {
        "draft_approved": True,
    })
    await pipeline.ainvoke(None, config=config)

    print("\n📨 Events after draft approval:")
    while not queue.empty():
        item = queue.get_nowait()
        print(f"  [{item['event']}] {item['data'].get('message', '')}")

    state = await pipeline.aget_state(config)
    print(f"\n✅ Final state next: {state.next}")

    # ✅ check final blog in DB
    blog = await db["blogs"].find_one({"_id": result.inserted_id})
    print(f"\n📄 Blog status: {blog.get('status')}")
    print(f"📄 Blog title: {blog.get('blog_title')}")
    print(f"📄 Content length: {len(blog.get('content', ''))}")

    unregister_queue(blog_id)
    print("\n🎉 Test complete!")

asyncio.run(test())