from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    MONGO_URI:str
    MAIL_EMAIL:str
    MAIL_PASSWORD:str    
    REFRESH_JWT_SECRET:str
    ACCESS_JWT_SECRET:str
    JWT_ALGO:str="HS256"
    ACCESS_TOKEN_EXPIRY_MINS:int=15
    REFRESH_TOKEN_EXPIRY_DAYS:int=7
    MODE:str="development"
    
    model_config=SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )
    
settings=Settings()