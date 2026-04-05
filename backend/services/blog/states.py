from typing import TypedDict, Annotated, List, Optional, AsyncGenerator
from schemas.agent import Plan, EvidenceItem, RouterDecision
from asyncio import Queue
import operator


class State(TypedDict):
    topic: str
    blog_id: str
    user_id: str

    mode: str
    needs_research: bool
    queries: List[str]
    reasoning: str

    evidence: List[EvidenceItem]

    plan: Optional[Plan]

    plan_approved: bool
    plan_feedback: Optional[str]
    draft_approved: bool
    draft_feedback: Optional[str]

    sections: Annotated[List[tuple], operator.add]  

    final: str
