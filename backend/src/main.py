from fastapi import FastAPI, Request
from dotenv import load_dotenv
from core_api import CoreAPI
from crew import ResearchHelperCrew
from pydantic import BaseModel

load_dotenv()
    
class TaskInputs(BaseModel):
    paper_content: str
    authors: str
    title: str
    journal: str = ""
    year: str

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



@app.post("/v1/crew/run")
async def run_crew(input_data: Request):
    request_data = await input_data.json()
    print(request_data)
    try:
        crew = ResearchHelperCrew()
        outputs = crew.run_crew(request_data)
        return outputs
    except Exception as e:
        return { "error": str(e) }