from services.hash import hash_password,verify_password
from core.connection import get_db
from schemas.userSchema import UserRegister,userLogin
from services.otp import send_otp 
from services.jwt import issue_token
from services.set_tokens import set_tokens
from fastapi import Response
async def create_user(userData:UserRegister):
    db=get_db()
    collection=db["users"]
    
    # check for existing user.
    existing_user=await collection.find_one({"email":userData.email})
    if(existing_user):
        # raise exception
        return None
    
    #hash password
    hashed_password=hash_password(userData.password)
    
    # user obj
    user={
        "firstname":userData.firstname,
        "lastname":userData.lastname,
        "email":userData.email,
        "password":hashed_password,
        "auth_provider":'local',
        "is_verified":False
    }
    
    result=await collection.insert_one(user)
    user_id=str(result.inserted_id)
    
    otp=await send_otp(email=userData.email,user_id=user_id)
    if not otp:
        await collection.delete_one({"_id":result.inserted_id})
        return None
    return user_id

        
async def login_user(data:userLogin,response: Response):
    db=get_db()
    collection=db["users"]
    
    # check if email exists
    user_exists=await collection.find_one(
        {"email":data.email},
    )
    if( not user_exists):
        return None
    
    # check if password is correct
    hashed_password=user_exists["password"]
    if(not verify_password(data.password,hashed_password)):
        return None
    
    #check if user verified
    user_id=str(user_exists["_id"])
    if(not user_exists["is_verified"]):
        # send otp for verification
        otp=await send_otp(email=user_exists["email"],user_id=user_id)
        if not otp:
            return {
                "status":"not_verified",
                "otp":"Failed to send",
                "user_id":user_id
            }
        return {"status": "not_verified", "otp":"sent", "user_id": user_id}  

    #  issue tokens
    tokens=await issue_token(user_id)
    # set token
    set_tokens(tokens,response)
    return {"status": "success", "user_id": user_id} 

