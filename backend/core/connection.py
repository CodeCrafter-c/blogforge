from motor.motor_asyncio import AsyncIOMotorClient

client: AsyncIOMotorClient | None = None
db = None

async def connect_to_mongo(uri: str):
    global client, db
    client = AsyncIOMotorClient(uri)
    db = client["blogforge"]
    
    await create_indexes()

async def create_indexes():
    await db["users"].create_index("email", unique=True)

    await db["users"].create_index("google_id", unique=True, sparse=True)
    await db["otp"].create_index("user_id")  
    await db["otp"].create_index("expires_at", expireAfterSeconds=0)

    await db["refresh_tokens"].create_index("user_id")
    await db["refresh_tokens"].create_index("created_at", expireAfterSeconds=60*60*24*7)

async def close_mongo_connection():
    global client
    if client:
        client.close()

def get_db():
    if db is None:
        raise RuntimeError("Database not connected yet")
    return db