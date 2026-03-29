from fastapi import APIRouter
from schemas.userSchema import UserRegister 
from controllers.user import create_user
auth_router=APIRouter()

@auth_router.post("/register")
async def register_user(userData:UserRegister):
    user= await create_user(userData)
    if(user):
        print("hi")
        return {
            "message":"user created successfuly",
            "user_id":str(user)
        }
    