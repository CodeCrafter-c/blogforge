from tools.llm import llm 
from services.blog.states import State
from schemas.agent import RouterDecision
from langchain_core.messages import SystemMessage,HumanMessage
from services.blog.sse import emit,EVENTS
ROUTER_SYSTEM="""
You are a routing module for a technical blog planner.

Decide whether web research is needed BEFORE planning.

Modes:
- closed_book (needs_research=false):
  Evergreen topics where correctness does not depend on recent facts (concepts, fundamentals).
- hybrid (needs_research=true):
  Mostly evergreen but needs up-to-date examples/tools/models to be useful.
- open_book (needs_research=true):
  Mostly volatile: weekly roundups, "this week", "latest", rankings, pricing, policy/regulation.

If needs_research=true:
- Output 3–10 high-signal queries.
- Queries should be scoped and specific (avoid generic queries like just "AI" or "LLM").
- If user asked for "last week/this week/latest", reflect that constraint IN THE QUERIES.

Also provide the reasoning for what you chose.
"""


async def router_node(state:State)->dict:
    blog_id=state.get("blog_id")
    await emit(blog_id, EVENTS["ROUTER_START"], {
        "message": "🔍 Analyzing topic and deciding research strategy..."
    })
    
    
    topic=state["topic"]
    decider=llm.with_structured_output(RouterDecision)
    
    decision=await decider.ainvoke(
        [
            SystemMessage(content=ROUTER_SYSTEM),
            HumanMessage(content=f"Topic : {topic}")
        ]
    )
    
    await emit(blog_id,EVENTS["ROUTER_DONE"],{
      "message": f"📊 Mode decided: {decision.mode}",
      "mode": decision.mode,
      "needs_research": decision.needs_research,
      "reasoning": decision.reasoning,
    })
    
    return {
        "needs_research":decision.needs_research,
        "mode":decision.mode,
        "queries":decision.queries,
        "reasoning":decision.reasoning
    }
    
def route_next(state: State):
    return "research" if state["needs_research"] else "orchestrator"

