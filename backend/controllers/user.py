from services.hash import hash_password,verify_password
from core.connection import get_db
from schemas.userSchema import UserRegister,userLogin,UserRegisterGoogle
from services.otp import send_otp 
from services.jwt import issue_token,decode_refresh_token
from services.set_tokens import set_tokens
from fastapi import Response,Request
import httpx
from bson import ObjectId
from core.config import settings
from clerk_backend_api import Clerk
from jose import jwt

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

async def logout_user(user_id:str,req:Request,res:Response):
    db=get_db()
    
    refresh_token = req.cookies.get("refresh_token")
    payload = decode_refresh_token(refresh_token)
    res.delete_cookie("access_token")
    res.delete_cookie("refresh_token")
    if(payload):
        await db["refresh_tokens"].delete_one({"jti": payload["jti"]})
    
    
# clerk=Clerk(bearer_auth=settings.CLERK_SECRET_KEY)
async def google_login(data:UserRegisterGoogle,response:Response):
    db=get_db()
    print(f"cel: ${settings.CLERK_SECRET_KEY}")
    jwks_url = "https://normal-koi-9.clerk.accounts.dev/.well-known/jwks.json"
    jwks_client = jwt.PyJWKClient(jwks_url)
    # verify clerk token
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(data.token)
        decoded = jwt.decode(
            data.token,
            signing_key.key,
            algorithms=["RS256"],         # Fixed: Added 's' to algorithms
            options={"verify_aud": False} # Fixed: Changed colon to underscore
        )
        if decoded.get("sub") != data.google_id:
            raise Exception("Token user mismatch")

    except Exception as e:
        return {
            "clerk_token": "invalid",
            "reason": str(e)
        }

    # check if user already exists
    existing=await db["users"].find_one({"email":data.email})
        
    if(existing):
        userId=str(existing["_id"])
    else:
        result=await db["users"].insert_one({
            "firstname":data.firstname,
            "lastname":data.lastname,
            "email":data.email,
            "google_id":data.google_id,
            "password":None,
            "auth_provider":"google",
            "is_verified":True
        }) 
        userId=str(result.inserted_id)
        
    #issue tokens
    tokens=await issue_token(userId)
    set_tokens(tokens,response)
    return {"clerk_token":"valid","userId":userId}

async def get_user(userId:str):
    db = get_db()
    user = await db["users"].find_one({"_id": ObjectId(userId)})
    if not user:
        return{"user":None}
    return {
        "user_id": userId,
        "firstname": user["firstname"],
        "lastname": user["lastname"],
        "email": user["email"],
    }