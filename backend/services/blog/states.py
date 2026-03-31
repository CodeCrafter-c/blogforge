from typing import TypedDict,Annotated,List
from schemas.agent import Plan
import operator

class State(TypedDict):
    topic:str
    plan:Plan
    sections:Annotated[List[str],operator.add]
    final:str
    
