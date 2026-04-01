from pydantic import BaseModel, Field
from typing import List,Literal,Optional

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
    tags:List[str]=Field(default_factory=list)
    requires_research:bool
    requires_citations:bool
    requires_code:bool
    
class Plan(BaseModel):
    blog_title:str
    audience:str
    tone:str
    blog_kind:Literal["explainer","tutorial","news_roundup","comparison","system_design"]
    constraints:List[str]=Field(default_factory=list)
    tasks:List[Task]
    
    
class RouterDecision(BaseModel):
    needs_research:bool
    mode:Literal["closed_book","hybrid","open_book"]
    queries:List[str]=Field(default_factory=list)
    reasoning:str
class EvidenceItem(BaseModel):
    title:str
    url:str
    published_at:Optional[str]=None
    snippet:Optional[str]=None
    source:Optional[str]=None
    
class EvidencePack(BaseModel):
    evidence:List[EvidenceItem]=Field(default_factory=list)
    
    
    