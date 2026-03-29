from services.hash import hash_password
from core.connection import get_db
from schemas.userSchema import UserRegister
from services.otp import send_otp 

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

        
        
        
