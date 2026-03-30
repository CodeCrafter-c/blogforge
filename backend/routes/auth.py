from fastapi import APIRouter,HTTPException,Response
from schemas.userSchema import UserRegister , verifyOtp
from controllers.user import create_user
from controllers.verify_user_otp import verify_user_otp

auth_router=APIRouter()

@auth_router.post("/register")
async def register_user(userData:UserRegister):
    user_id= await create_user(userData)
    if(user_id):
        return {
        "message": "User created successfully, OTP sent to your email",
        "user_id": str(user_id)
        }

@auth_router.post("/verify-otp")
async def verify_otp_route(data:verifyOtp,response:Response):
    user_id=data.user_id
    otp=data.otp
    verified=await verify_user_otp(user_id,otp,response)
    if(not verified):
        raise HTTPException(status_code=400,detail="invalid or expired otp")
    return {"messsage":"Email verified successfully"}


@auth_router.post("/login")
async def login_route(data):
    pass