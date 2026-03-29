from fastapi_mail import FastMail , MessageSchema, ConnectionConfig
from core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_EMAIL,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_EMAIL,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

fm = FastMail(conf)

async def send_otp_email(email:str, otp:str):
    message = MessageSchema(
        subject="BlogForge - Verify your email",
        recipients=[email],
        body=f"""
        <h2>Welcome to BlogForge!</h2>
        <p>Your OTP is:</p>
        <h1 style="color: #4F46E5;">{otp}</h1>
        <p>This OTP expires in 1 minute.</p>
        <p>If you didn't request this, ignore this email.</p>
        """,
        subtype="html"
    )
    await fm.send_message(message)