import httpx
from core.config import settings
from urllib.parse import urlencode
TWITTER_CLIENT_ID=settings.TWITTER_CLIENT_ID
TWITTER_CLIENT_SECRET=settings.TWITTER_CLIENT_SECRET
TWITTER_REDIRECT_URI=settings.TWITTER_REDIRECT_URI
TWITTER_SCOPES = "tweet.read tweet.write users.read offline.access"

def get_auth_url(state:str,code_challenge:str)->str:
    params={
        'response_type':'code',
        'client_id':TWITTER_CLIENT_ID,
        'redirect_uri':TWITTER_REDIRECT_URI,
        'scope':TWITTER_SCOPES,
        'state':state,
        "code_challenge":code_challenge,
        "code_challenge_method":"S256"
    }
    return f"https://twitter.com/i/oauth2/authorize?{urlencode(params)}"

async def exchange_code_for_token(code: str, code_verifier: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.twitter.com/2/oauth2/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": TWITTER_REDIRECT_URI,
                "code_verifier": code_verifier,
            },
            auth=(TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET),
        )
        return response.json()
    
async def post_tweet(access_token: str, text: str) -> dict:
    async with httpx.AsyncClient() as client:
        # ✅ first get the user's username
        me = await client.get(
            "https://api.twitter.com/2/users/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        username = me.json().get("data", {}).get("username", "")

        # then post the tweet
        response = await client.post(
            "https://api.twitter.com/2/tweets",
            headers={"Authorization": f"Bearer {access_token}"},
            json={"text": text},
        )
        data = response.json()
        tweet_id = data.get("data", {}).get("id")
        
        return {
            **data,
            "tweet_url": f"https://x.com/{username}/status/{tweet_id}"
        }