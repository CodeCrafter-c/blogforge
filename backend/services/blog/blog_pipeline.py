# graph.py
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from services.blog.states import State
from tools.fanout import fanout
from services.blog.nodes.reducer import reducer, finalize_node, route_after_draft
from services.blog.nodes.orchestrator import orchestator, route_after_plan
from services.blog.nodes.worker import worker
from services.blog.nodes.router import router_node, route_next
from services.blog.nodes.research import research_node

checkpointer = MemorySaver()

g = StateGraph(State)
g.add_node("orchestrator", orchestator)
g.add_node("router", router_node)
g.add_node("research", research_node)
g.add_node("worker", worker)
g.add_node("reducer", reducer)
g.add_node("finalize", finalize_node)

g.add_edge(START, "router")
g.add_conditional_edges("router", route_next, {
    "research": "research",
    "orchestrator": "orchestrator",
})
g.add_edge("research", "orchestrator")
g.add_conditional_edges("orchestrator", fanout, ["worker"])  # ✅ straight
g.add_edge("worker", "reducer")
g.add_edge("reducer", "finalize")  # ✅ straight
g.add_edge("finalize", END)

pipeline = g.compile(
    checkpointer=checkpointer,
    interrupt_before=["worker", "finalize"],  # ✅ only these two
)