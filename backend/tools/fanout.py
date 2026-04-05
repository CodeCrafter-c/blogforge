from langgraph.types import Send
from services.blog.states import State

def fanout(state: State):
    # Guard against re-running workers — only safe because orchestrator clears sections on re-plan
    if state.get("sections"):
        return []

    return [
        Send(
            "worker",
            {
                "task": task,
                "topic": state["topic"],
                "mode": state.get("mode", "closed_book"),
                "plan": state["plan"],
                "evidence": [e.model_dump() for e in state.get("evidence", [])],  # ✅ always serialize
                "blog_id": state.get("blog_id"), 
            }
        )
        for task in state["plan"].tasks
    ]