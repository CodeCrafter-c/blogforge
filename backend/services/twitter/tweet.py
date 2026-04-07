from tools.llm import llm
from langchain_core.messages import SystemMessage, HumanMessage
from core.connection import get_db
from bson import ObjectId

TWEET_SYSTEM = """
You are writing a tweet to promote a blog post.

Write a single tweet (MAX 250 characters, leaving room for a link) that:
- Opens with a hook (a question, surprising fact, or bold claim)
- Captures the core insight of the blog in plain language
- Matches the tone and audience of the blog
- Ends with 2-3 relevant hashtags
- Sounds human and engaging, not corporate or generic

Output ONLY the tweet text, nothing else.
"""

async def summarize_blog(blog_id: str) -> dict:
    db = get_db()
    
    blog_data = await db["blogs"].find_one({"_id": ObjectId(blog_id)})
    if not blog_data:
        raise Exception(f"Blog {blog_id} not found")
    if not blog_data.get("content"):
        raise Exception("Blog content not ready yet")
    blog_plan = blog_data.get("plan", {})
    tweet = await llm.ainvoke([
        SystemMessage(content=TWEET_SYSTEM),
        HumanMessage(content=(
            f"Blog title: {blog_data.get('blog_title', '')}\n"
            f"Audience: {blog_plan.get('audience', 'general')}\n"
            f"Tone: {blog_plan.get('tone', 'neutral')}\n"
            f"Blog kind: {blog_plan.get('blog_kind', 'article')}\n"
            f"Content (first 1000 chars): {blog_data.get('content', '')[:1000]}\n\n"
            f"Write the tweet now."
))
    ])

    return {
        "tweet": tweet.content.strip()
    }