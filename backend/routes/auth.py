from fastapi import APIRouter,HTTPException,Response,Request,Depends
from schemas.userSchema import UserRegister , verifyOtp,userLogin
from controllers.user import create_user,login_user,logout_user
from controllers.verify_user_otp import verify_user_otp
from middlewares.auth import auth
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
async def login_route(data:userLogin,response:Response):
    result=await login_user(data,response)
    if(not result):
        raise HTTPException(status_code=400,detail="email or password is incorrect")
    
    if result["status"] == "not_verified":
        if result["otp"] == "Failed to send":
            return {
            "message": "Email not verified, failed to send OTP please try later",
            "user_id": result["user_id"]
            }
        return {
        "message": "Email not verified, OTP sent to your email",
        "user_id": result["user_id"]
        }

    return{
        "message":"login successfull",
        "user_id":result["user_id"]
    }
    

@auth_router.post("/logout")
async def logout_route(req:Request,res:Response,user_id:str=Depends(auth)):
    await logout_user(user_id,req,res)
    return {"message": "Logged out successfully"}

