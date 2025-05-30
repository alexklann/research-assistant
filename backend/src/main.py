from fastapi import FastAPI
from dotenv import load_dotenv
from core_api import CoreAPI

load_dotenv()

app = FastAPI()
core_api = CoreAPI()

@app.get("/")
async def hello_world():
    return { "message": "Hello from FastAPI!" }

@app.get("/v1/search")
async def search(query: str, page: int = 1):
    """
    Perform a search operation using the provided query string.
    :param query: The search query string.
    :param page: The page number for pagination.
    :return: Search results.
    """
    try:
        results = core_api.search(query, page)
        return results
    except Exception as e:
        return { "error": str(e) }