from fastapi import Request,Response,HTTPException,Depends
from services.jwt import decode_access_token,decode_refresh_token,create_access_token,create_refresh_token
from core.connection import get_db
from core.config import settings
from bson import ObjectId
from datetime import datetime,timezone
from services.set_tokens import set_tokens

async def auth(request:Request,response:Response):
    db=get_db()
    
    # check access token
    access_token=request.cookies.get("access_token")
    
    if not access_token:
        raise HTTPException(status_code=401,detail="Acess token missing")
    
    # verify access token
    payload=decode_access_token(access_token)
    if(payload):
        return payload["user_id"]
    
    #check refresh token
    refresh_token=request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(status_code=401,detail="Access expired and no refresh token")
    
    #verify refresh token
    payload=decode_refresh_token(refresh_token)
    if(not payload):
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        raise HTTPException(status_code=401,detail="Access expired, invalid refresh token")
    
    
    user_id=payload["user_id"]
    jti=payload["jti"]
    
    user=await db["users"].find_one({"_id":ObjectId(user_id)})
    if not user:
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        raise HTTPException(status_code=401,detail="user not found")
    
    # check jti in db
    stored_token=await db["refresh_tokens"].find_one({
        "jti":jti
    })
    
    # reusue of deleted token
    if(not stored_token):
        await db["refresh_tokens"].delete_many({"user_id":user_id})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        raise HTTPException(status_code=401,detail="Reuse of token detected")
    
    # rotation of refresh token
    await db["refresh_tokens"].delete_one({"jti": jti})
    refresh_data = create_refresh_token(user_id)
    
    await db["refresh_tokens"].insert_one({
    "user_id": user_id,
    "jti": refresh_data["jti"],
    "created_at": datetime.now(timezone.utc)
    })
    
    new_access_token=create_access_token(user_id)
    set_tokens({
        "access_token":new_access_token,
        "refresh_token":refresh_data["token"]
        },response)
    return user_id