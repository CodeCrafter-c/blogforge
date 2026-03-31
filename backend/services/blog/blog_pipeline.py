from langgraph.graph import StateGraph, START, END
from services.blog.states import State
from tools.fanout import fanout
from services.blog.nodes.reducer import reducer
from services.blog.nodes.orchestrator import orchestator
from services.blog.nodes.worker import worker


g = StateGraph(State)
g.add_node("orchestrator", orchestator)
g.add_node("worker", worker)
g.add_node("reducer", reducer)

g.add_edge(START, "orchestrator")
g.add_conditional_edges("orchestrator", fanout, ["worker"])
g.add_edge("worker", "reducer")
g.add_edge("reducer", END)

app = g.compile()

out = app.invoke({"topic": "Write a blog on Docker basics", "sections": []})
print(out["final"])