from tools.llm import llm
from langchain_core.messages import SystemMessage,HumanMessage
from schemas.agent import EvidenceItem
from services.blog.sse import emit,EVENTS
WORKER_SYSTEM="""
You are a senior technical writer and developer advocate. Write ONE section of a technical blog post in Markdown.\n\n
        Hard constraints:\n
            "- Follow the provided Goal and cover ALL Bullets in order (do not skip or merge bullets).\n
        - Stay close to the Target words (±15%).\n
        - Output ONLY the section content in Markdown (no blog title H1, no extra commentary).\n\n
        Technical quality bar:\n
        - Be precise and implementation-oriented (developers should be able to apply it).\n
        - Prefer concrete details over abstractions: APIs, data structures, protocols, and exact terms.\n
        - When relevant, include at least one of:\n
          * a small code snippet (minimal, correct, and idiomatic)\n
          * a tiny example input/output\n
          * a checklist of steps\n
          * a diagram described in text (e.g., 'Flow: A -> B -> C')\n
        - Explain trade-offs briefly (performance, cost, complexity, reliability).\n
        - Call out edge cases / failure modes and what to do about them.\n"        
        - If you mention a best practice, add the 'why' in one sentence.\n\n
        Markdown style:\n
        - Start with a '## <Section Title>' heading.\n
        - Use short paragraphs, bullet lists where helpful, and code fences for code.\n
        - Avoid fluff. Avoid marketing language.\n
        - If you include code, keep it focused on the bullet being addressed.\n
"""


async def worker(payload:dict)->dict:
    task = payload["task"]
    topic = payload["topic"]
    plan = payload["plan"]
    blog_id=payload["blog_id"]
    raw = payload.get("evidence", [])
    evidence = [EvidenceItem(**e) if isinstance(e, dict) else e for e in raw]
    mode=payload.get("mode", "closed_book")
    # queue=payload.get("event_queue")
    print("working")    
    await emit(blog_id,EVENTS["WRITING_START"],{
        "message":f"✍️ Writing: {task.title}",
        "section_id":task.id,
        "section_tittle": task.title,
    })
    
    bullets_text = "\n- " + "\n- ".join(task.bullets)
    evidence_text = ""
    if evidence:
        evidence_text = "\n".join(
            f"- {e.title} | {e.url} | {e.published_at or 'date:unknown'}".strip()
            for e in evidence[:20]
        )

    result=  await llm.ainvoke(
        [
            SystemMessage(content=WORKER_SYSTEM),
            HumanMessage(
                content=(
                    f"Blog title: {plan.blog_title}\n"
                    f"Audience: {plan.audience}\n"
                    f"Tone: {plan.tone}\n"
                    f"Blog kind: {plan.blog_kind}\n"
                    f"Constraints: {plan.constraints}\n"
                    f"Topic: {topic}\n"
                    f"Mode: {mode}\n\n"
                    f"Section title: {task.title}\n"
                    f"Goal: {task.goal}\n"
                    f"Target words: {task.target_words}\n"
                    f"Tags: {task.tags}\n"
                    f"requires_research: {task.requires_research}\n"
                    f"requires_citations: {task.requires_citations}\n"
                    f"requires_code: {task.requires_code}\n"
                    f"Bullets:{bullets_text}\n\n"
                    f"Evidence (ONLY use these URLs when citing):\n{evidence_text}\n"
                )
            ),
        ]
    )
    section_md = result.content.strip()
    
    await emit(blog_id,EVENTS["SECTION_DONE"],{
        "message": f"✅ Section done: {task.title}",
        "section_id": task.id,
        "section_title": task.title,
    })
    return {"sections": [(task.id, section_md)]}
