from pydantic import BaseModel

class PostTweetRequest(BaseModel):
    blog_id: str
    tweet: str