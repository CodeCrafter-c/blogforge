from datetime import datetime, timedelta, timezone
from jose import jwt,JWTError
from core.config import settings
from core.connection import get_db
import uuid


access_token_expiry=settings.ACCESS_TOKEN_EXPIRY_MINS
refresh_token_expiry=settings.REFRESH_TOKEN_EXPIRY_DAYS
access_token_secret=settings.ACCESS_JWT_SECRET
refresh_token_secret=settings.REFRESH_JWT_SECRET
jwt_algo=settings.JWT_ALGO


def create_access_token(user_id:str)->str:
    expire=datetime.now(timezone.utc)+timedelta(minutes=access_token_expiry)
    payload={
        "user_id":user_id,
        "exp":expire,
        "type":"access"
    }
    return jwt.encode(payload,access_token_secret,algorithm=jwt_algo)


def create_refresh_token(user_id:str)->str:
    expire=datetime.now(timezone.utc)+timedelta(days=refresh_token_expiry)
    payload={
        "user_id":user_id,
        "exp":expire,
        "type":"refresh",
        "jti":str(uuid.uuid4())
    }
    return {
        "token":jwt.encode(payload,refresh_token_secret,algorithm=jwt_algo),
        "jti":payload["jti"]
        }


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, access_token_secret, algorithms=[jwt_algo])
    except JWTError:
        return None
def decode_refresh_token(token:str)-> dict:
    try:
        return jwt.decode(token,refresh_token_secret,algorithms=[jwt_algo])
    except JWTError:
        return None

async def issue_token(user_id:str)->dict:
    db=get_db()
    access_token=create_access_token(user_id)
    refresh_data=create_refresh_token(user_id)
    token=refresh_data["token"]
    jti=refresh_data["jti"]    
    
    await db["refresh_tokens"].insert_one({
        "user_id":user_id,
        "jti":jti,
        "created_at":datetime.now(timezone.utc)
    })
    return {
            "access_token":access_token,
            "refresh_token":token
    }