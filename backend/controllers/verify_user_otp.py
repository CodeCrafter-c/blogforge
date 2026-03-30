from services.otp import verify_otp
from services.jwt import issue_token
from fastapi import Response
from services.set_tokens import set_tokens

async def verify_user_otp(user_id,otp,response:Response):
    user_id= await verify_otp(user_id,otp)
    if(not user_id):
        return None
    
    # tokens
    tokens=await issue_token(user_id)
    set_tokens(tokens,response)    
    
    
    return True