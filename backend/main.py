from contextlib import asynccontextmanager
from fastapi import FastAPI
from routes.auth import auth_router
from core.config import settings
from core.connection import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    await connect_to_mongo(settings.MONGO_URI)
    yield
    # shutdown
    await close_mongo_connection()

app = FastAPI(lifespan=lifespan)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])