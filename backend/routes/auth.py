from fastapi import APIRouter
from schemas.userSchema import UserRegister 
from controllers.user import create_user
auth_router=APIRouter()

@auth_router.post("/register")
async def register_user(userData:UserRegister):
    user_id= await create_user(userData)
    if(user_id):
        return {
        "message": "User created successfully, OTP sent to your email",
        "user_id": str(user_id)
        }
    