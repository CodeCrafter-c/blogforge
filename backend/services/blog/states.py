from typing import TypedDict,Annotated,List
from schemas.agent import Plan,EvidenceItem
import operator

class State(TypedDict):
    topic:str
    
    mode:str
    needs_research:bool
    queries:List[str]
    evidence:List[EvidenceItem]
    plan:Plan
    sections:Annotated[List[tuple[int, str]], operator.add]
    final:str
    
