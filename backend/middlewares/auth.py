from fastapi import Request, Response, HTTPException, Depends
from services.jwt import decode_access_token, decode_refresh_token, create_access_token, create_refresh_token
from core.connection import get_db
from core.config import settings
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timezone
from services.set_tokens import set_tokens

async def auth(request: Request, response: Response, db = Depends(get_db)):
    access_token = request.cookies.get("access_token")
    refresh_token = request.cookies.get("refresh_token")
    # 2. Try authenticating via access token first
    if access_token:
        payload = decode_access_token(access_token)
        if payload:
            return payload["user_id"]

    # 3. Access token was missing or invalid. Fall back to refresh token.
    if not refresh_token:
        raise HTTPException(
            status_code=401, 
            detail="Tokens missing or expired"
        )
    
    # 4. Verify refresh token
    payload = decode_refresh_token(refresh_token)
    if not payload:
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        raise HTTPException(status_code=401, detail="Access expired, invalid refresh token")
    
    user_id = payload["user_id"]
    jti = payload["jti"]
    
    # Safely convert to ObjectId to avoid 500 errors on manipulated payloads
    try:
        user_object_id = ObjectId(user_id)
    except InvalidId:
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        raise HTTPException(status_code=401, detail="Invalid user token payload")

    user = await db["users"].find_one({"_id": user_object_id})
    if not user:
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        raise HTTPException(status_code=401, detail="User not found")
    
    # 5. Check jti (Refresh Token Identifier) in db
    stored_token = await db["refresh_tokens"].find_one({"jti": jti})
    
    # 6. Reuse of deleted block-listed token
    if not stored_token:
        await db["refresh_tokens"].delete_many({"user_id": user_id})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        raise HTTPException(status_code=401, detail="Reuse of token detected, forced logout")
    
    # 7. Rotation of refresh token
    await db["refresh_tokens"].delete_one({"jti": jti})
    refresh_data = create_refresh_token(user_id)
    
    await db["refresh_tokens"].insert_one({
        "user_id": user_id,
        "jti": refresh_data["jti"],
        "created_at": datetime.now(timezone.utc)
    })
    
    # 8. Create new access token and apply all tokens to cookies
    new_access_token = create_access_token(user_id)
    set_tokens({
        "access_token": new_access_token,
        "refresh_token": refresh_data["token"]
    }, response)
    
    return user_id
