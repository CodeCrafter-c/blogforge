from langgraph.types import Send
from services.blog.states import State

def fanout(state: State):
    return[
        Send(
            "worker",
            {
                "task":task,
                "topic":state["topic"],
                "mode":state["mode"],
                "plan":state["plan"],
                "evidence":state["evidence"]
            }
        )
        for task in state["plan"].tasks
    ]
    
    

