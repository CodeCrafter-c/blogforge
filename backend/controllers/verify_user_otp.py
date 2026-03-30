from services.otp import verify_otp
from services.jwt import issue_token
from fastapi import Response
from core.config import settings

async def verify_user_otp(user_id,otp,response:Response):
    user_id= await verify_otp(user_id,otp)
    if(not user_id):
        return None
    
    # tokens
    tokens=await issue_token(user_id)
    
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure= True if settings.MODE.lower()=="production" else False ,
        samesite="lax",
        max_age=60*60*24*7
    )
    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=True if settings.MODE.lower()=="production" else False,
        samesite="lax",
        max_age=60*15
    )
    
    return True