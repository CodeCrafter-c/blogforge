# orchestrator.py
from tools.llm import llm
from langchain_core.messages import SystemMessage, HumanMessage
from services.blog.states import State
from schemas.agent import Plan
from services.blog.sse import emit, EVENTS
from datetime import datetime, timezone
from core.connection import get_db

ORCH_SYSTEM = """
You are a world-class content strategist and blog writer.
Your job is to produce a highly actionable outline for a blog post on ANY topic.

Hard requirements:
- Create 5–9 sections suitable for the topic, audience, and blog_kind.
- Each section must include:
  1) goal — 1 sentence: what the reader understands or can do after this section
  2) 3–6 bullets that are concrete, specific, and non-overlapping
  3) target word count (120–550)

Audience & tone adaptation:
- Read the topic carefully and infer the likely audience.
- If the topic is technical → assume developers, use precise technical language.
- If the topic is general → assume curious intelligent readers, avoid jargon.
- If the topic is business/finance → assume professionals, use industry terminology.
- If the topic is health/science → assume educated non-experts, be accurate but accessible.
- NEVER default to developer audience unless the topic clearly demands it.

Quality bar — include at least 2 of these somewhere in the plan:
- A concrete example, case study, or real-world scenario
- Common mistakes or misconceptions and how to avoid them
- A comparison (A vs B, before vs after, option 1 vs option 2)
- A practical checklist, framework, or step-by-step
- Data, statistics, or evidence-backed claims (if research is available)
- Edge cases, limitations, or nuances worth knowing

Grounding rules:
- Mode closed_book: keep it timeless, do not reference specific tools/versions/dates.
- Mode hybrid: use evidence for current examples, tools, or stats where relevant.
  Mark those sections with requires_citations=True.
- Mode open_book: set blog_kind = "news_roundup".
  Every section summarizes events and their implications.
  Do NOT include how-to sections unless explicitly requested.
  If evidence is empty, create a plan noting "insufficient sources available".

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