from services.hash import hash_password
from core.connection import get_db
from schemas.userSchema import UserRegister

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
    }
    
    result=await collection.insert_one(user)
    return result.inserted_id
        
        
        
