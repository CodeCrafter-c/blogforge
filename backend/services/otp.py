import random
from datetime import datetime,timedelta,timezone
from core.connection import get_db
from bson import ObjectId
from core.mailer import send_otp_email

def generate_otp()-> str:   
    return str(random.randint(100000, 999999))

async def can_resend_otp(user_id:str)-> bool:
    db=get_db()
    last_otp= await db["otp"].find_one(
        {"user_id":user_id},
        sort=[("created_at",-1)]
    )
    
    if not last_otp:
        return True
    last_otp_time=last_otp["created_at"].replace(tzinfo=timezone.utc)    
    time_passed=datetime.now(timezone.utc) - last_otp_time
    print(time_passed)
    return time_passed.total_seconds()>59
    
    

async def send_otp(user_id:str,email:str)->str:
    db=get_db()
    
    # check if we can send otp
    if not await can_resend_otp(user_id):
        return None
    
    
    otp=generate_otp()
    now=datetime.now(timezone.utc)
    
    otp_doc={
        "user_id":user_id,
        "otp":otp,
        "created_at":now,
        "expires_at":now+timedelta(seconds=59),
    }
    
    await db["otp"].insert_one(otp_doc)
    await send_otp_email(email,otp)
    return otp
    
    
async def verify_otp(user_id:str,otp:str)->bool:
    db=get_db()
    
    otp_doc=await db["otp"].find_one({
        "user_id":user_id,
        "otp":otp,
        "expires_at":{"$gt":datetime.now(timezone.utc)}
    })
    
    if not otp_doc:
        return False
    
    await db["users"].update_one(
        {"_id":ObjectId(user_id)},
        {"$set":{"is_verified":True}}
        
    )
    return True