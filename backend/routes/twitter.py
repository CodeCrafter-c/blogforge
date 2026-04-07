import hashlib, base64, secrets
from fastapi import APIRouter, Depends,Request,HTTPException
from fastapi.responses import RedirectResponse
from middlewares.auth import auth
from services.twitter.auth import exchange_code_for_token,get_auth_url,post_tweet
from core.connection import get_db
from datetime import datetime,timezone
from bson import ObjectId
from services.twitter.tweet import summarize_blog
from schemas.twitter import PostTweetRequest
from core.config import settings
twitter_router=APIRouter()

pending_auth:dict={}
@twitter_router.get("/connect")
async def connect_twitter(user_id:str=Depends(auth)):
    code_verifier=secrets.token_urlsafe(64)
    code_challenge=base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).rstrip(b"=").decode()
    
    state=secrets.token_urlsafe(16)
    pending_auth[state]={
        "user_id":user_id,
        "code_verifier":code_verifier
    }
    url=get_auth_url(state=state,code_challenge=code_challenge)
    return RedirectResponse(url)

@twitter_router.get("/status")
async def twitter_status(user_id: str = Depends(auth)):
    db = get_db()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    return {"connected": bool(user and user.get("twitter_access_token"))}


@twitter_router.get("/callback")
async def twitter_callback(code:str,state:str):
    pending=pending_auth.pop(state,None)
    if not pending:
        return {"error : invalid state"}
    
    token_data=await exchange_code_for_token(
        code=code,
        code_verifier=pending['code_verifier']
    )
    
    db=get_db()
    await db["users"].update_one(
        {"_id": ObjectId(pending["user_id"])},
        {"$set":{
            "twitter_access_token":token_data["access_token"],
            "twitter_refresh_token":token_data["refresh_token"],
            "updated_at":datetime.now(timezone.utc)
        }}
    )
    
    return RedirectResponse("http://localhost:5173/dashboard?twitter=connected")


@twitter_router.get("/preview/{blog_id}")
async def tweet_preview(blog_id:str,user_id:str=Depends(auth)):
    result=await summarize_blog(blog_id)
    return result


@twitter_router.post("/post")
async def post_to_twitter(data: PostTweetRequest, user_id: str = Depends(auth)):
    db = get_db()
    tweet = data.tweet
    
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    token = user.get("twitter_access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Twitter not connected")
    
    result = await post_tweet(access_token=token, text=tweet)
    print(f"🐦 Twitter response: {result}")  # ✅ see exactly what Twitter returned
    
    if "errors" in result:
        raise HTTPException(status_code=400, detail=result["errors"])
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    tweet_url = result.get("tweet_url")
    return {"tweet_url": tweet_url}