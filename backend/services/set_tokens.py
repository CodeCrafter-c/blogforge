from fastapi import Response
from core.config import settings
def set_tokens(tokens,response:Response):
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