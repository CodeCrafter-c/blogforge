from pydantic import BaseModel, Field
from typing import List,Literal

class Task(BaseModel):
    id:int
    title:str
    goal:str=Field(...,description="One sentence that describes what reader should do/unserstand")
    bullets:List[str]=Field(...,
    min_length=3,
    max_length=6,
    description="3-5 concrete , non overlappoing subpoints  to cover in this section "
    )
    target_words: int = Field(..., description="Target words (120–550).")
    section_type:Literal[
        "intro","core","examples","checklist","common_mistakes","Conclusion"]=Field(
            ...,
            description="use common_mistakes exaclty once in the plan"
        )

    
class Plan(BaseModel):
    blog_title:str
    audience:str
    tone:str
    tasks:List[Task]
    
