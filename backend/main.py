from contextlib import asynccontextmanager
from fastapi import FastAPI
from routes.auth import auth_router
from routes.blog import blog_router
from core.config import settings
from core.connection import connect_to_mongo, close_mongo_connection
from fastapi.middleware.cors import CORSMiddleware
from routes.twitter import twitter_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    await connect_to_mongo(settings.MONGO_URI)
    yield
    # shutdown
    await close_mongo_connection()

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"], 
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(blog_router,prefix="/blog",tags=["Blog"])
app.include_router(twitter_router,prefix="/twitter",tags=["Twitter"])