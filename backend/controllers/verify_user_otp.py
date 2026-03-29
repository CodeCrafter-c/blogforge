from services.otp import verify_otp

async def verify_user_otp(user_id,otp):
    is_verified= await verify_otp(user_id,otp)
    if(is_verified):
        return True
    return None