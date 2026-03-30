from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserRegister(BaseModel):
    firstname: str = Field(min_length=2, max_length=50)
    lastname: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)
    
class UserRegisterGoogle(BaseModel):
    firstname: str = Field(min_length=2, max_length=50)
    lastname: str = Field(min_length=2, max_length=50)
    email: EmailStr
    google_id: str  

class UserResponse(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
class verifyOtp(BaseModel):
    user_id:str
    otp:str=Field(max_length=6,min_length=6)
    