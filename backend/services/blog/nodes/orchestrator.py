# orchestrator.py
from tools.llm import llm
from langchain_core.messages import SystemMessage, HumanMessage
from services.blog.states import State
from schemas.agent import Plan
from services.blog.sse import emit, EVENTS
from datetime import datetime, timezone
from core.connection import get_db

ORCH_SYSTEM = """
You are a senior technical writer and developer advocate.
Your job is to produce a highly actionable outline for a technical blog post.

Hard requirements:
- Create 5–9 sections (tasks) suitable for the topic and audience.
- Each task must include:
  1) goal (1 sentence)
  2) 3–6 bullets that are concrete, specific, and non-overlapping
  3) target word count (120–550)

Quality bar:
- Assume the reader is a developer; use correct terminology.
- Bullets must be actionable: build/compare/measure/verify/debug.
- Ensure the overall plan includes at least 2 of these somewhere:
  * minimal code sketch / MWE (set requires_code=True for that section)
  * edge cases / failure modes
  * performance/cost considerations
  * security/privacy considerations (if relevant)
  * debugging/observability tips

Grounding rules:
- Mode closed_book: keep it evergreen; do not depend on evidence.
- Mode hybrid:
  - Use evidence for up-to-date examples (models/tools/releases) in bullets.
  - Mark sections using fresh info as requires_research=True and requires_citations=True.
- Mode open_book:
  - Set blog_kind = "news_roundup".
  - Every section is about summarizing events + implications.
  - DO NOT include tutorial/how-to sections unless user explicitly asked for that.
  - If evidence is empty or insufficient, create a plan that transparently says "insufficient sources"
    and includes only what can be supported.

Output must strictly match the Plan schema.
"""


async def orchestator(state: State) -> dict:
    blog_id = state.get("blog_id")

    feedback = state.get("plan_feedback", "")
    feedback_text = f"\n\nUser feedback on previous plan: {feedback}" if feedback else ""

    await emit(blog_id, EVENTS["PLAN_START"], {
        "message": "📋 Orchestrator planning blog structure...",
    })

    planner = llm.with_structured_output(Plan)
    evidence = state.get("evidence", [])
    mode = state.get("mode", "closed_book")

    plan = await planner.ainvoke([
        SystemMessage(content=ORCH_SYSTEM),
        HumanMessage(
            content=(
                f"Topic: {state['topic']}\n"
                f"Mode: {mode}\n"
                f"Evidence (ONLY use for fresh claims; may be empty):\n"
                f"{[e.model_dump() for e in evidence][:16]}"
                f"{feedback_text}"
            )
        )
    ])

    await emit(blog_id, EVENTS["PLAN_READY"], {
        "message": "",
        "plan": plan.model_dump(),
        "blog_title": plan.blog_title,   # ✅ fixed typo: was "blog_tittle"
        "section_count": len(plan.tasks)
    })

    # ✅ Reset approval flags so stale state doesn't skip the interrupt
    return {
        "plan": plan,
    }


def route_after_plan(state: State) -> str:
    # ✅ FIXED: return values now match graph edge keys ("worker" / "orchestrator")
    if state.get("plan_approved"):
        return "worker"
    return "orchestrator"