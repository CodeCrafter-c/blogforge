from langgraph.graph import StateGraph, START, END
from services.blog.states import State
from tools.fanout import fanout
from services.blog.nodes.reducer import reducer
from services.blog.nodes.orchestrator import orchestator
from services.blog.nodes.worker import worker
from services.blog.nodes.router import router_node,route_next
from services.blog.nodes.research import research_node


g = StateGraph(State)
g.add_node("orchestrator", orchestator)
g.add_node("router", router_node)
g.add_node("research", research_node)
g.add_node("worker", worker)
g.add_node("reducer", reducer)


g.add_edge(START, "router")
g.add_conditional_edges("router",route_next, {"research": "research", "orchestrator": "orchestrator"})
g.add_edge("research", "orchestrator")
g.add_conditional_edges("orchestrator", fanout, ["worker"])
g.add_edge("worker", "reducer")
g.add_edge("reducer", END)

app = g.compile()

def run(topic: str):
    out = app.invoke(
        {
            "topic": topic,
            "mode": "",
            "needs_research": False,
            "queries": [],
            "evidence": [],
            "plan": None,
            "sections": [],
            "final": "",
        }
    )

    return out
run("iran usa war")