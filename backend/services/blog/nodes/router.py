from tools.llm import llm 
from services.blog.states import State
from schemas.agent import RouterDecision
from langchain_core.messages import SystemMessage,HumanMessage
from services.blog.sse import emit,EVENTS
ROUTER_SYSTEM = """
You are a routing module for a blog content planner.

Given a blog topic, decide whether web research is needed BEFORE planning.

Modes:
- closed_book (needs_research=false):
  Timeless topics where correctness does not depend on recent facts.
  Examples: concepts, fundamentals, history, how-things-work, opinion pieces.
- hybrid (needs_research=true):
  Mostly timeless but benefits from current examples, tools, stats, or recent developments.
  Examples: best practices, comparisons, guides that reference current tools.
- open_book (needs_research=true):
  Highly time-sensitive content. Examples: news roundups, "this week/month/year",
  rankings, pricing, policy changes, product launches, current events.

Important:
- Do NOT assume the topic is technical or developer-focused.
- Adapt to whatever domain the topic belongs to: tech, science, business, health, culture, etc.
- If needs_research=true, output 3–10 high-signal, specific search queries.
- Queries must reflect the actual domain and time constraint of the topic.
- Avoid generic queries like just "AI" or "marketing".

Also provide reasoning for your decision.
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

