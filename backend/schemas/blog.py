from pydantic import BaseModel,Field
from typing import List,Optional,Literal
from datetime import datetime,timezone

class CreateBlogRequest(BaseModel):
    topic:str=Field(... ,min_length=3,max_length=600)

class BlogDocument(BaseModel):
    userId:str
    topic:str
    status:Literal["idle", "generating", "awaiting_plan_approval", "awaiting_draft_approval", "completed", "failed"] = "idle"
    mode:Optional[str]=None
    blog_title: Optional[str] = None
    plan: Optional[dict] = None
    content: Optional[str] = None
    sources: List[str] = []
    created_at:datetime=Field(default_factory=datetime.now(timezone.utc))
    updated_at:datetime=Field(default_factory=datetime.now(timezone.utc))
    
class ApprovePlanRequest(BaseModel):
    blog_id:str
    approved:bool
    feedback:Optional[str]=None
    
class ApproveDraftRequest(BaseModel):
    blog_id:str
    approved:bool
    Feedback:Optional[str]=None
    
class MessageDocument(BaseModel):
    blog_id: str
    user_id: str
    role: Literal["user", "assistant"]
    type: Literal["status_update", "plan_ready", "draft_ready", "improve", "publish_twitter", "feedback", "general"]
    content: str
    metadata: Optional[dict] = None  
    created_at: datetime = Field(default_factory=datetime.now(timezone.utc))
    
    
class SendMessageRequest(BaseModel):
    type: Literal["improve", "publish_twitter", "feedback", "general"]
    content: str