# backend/src/main.py

from fastapi import FastAPI, Request
from dotenv import load_dotenv
from core_api.core import CoreAPI
from crew import ResearchHelperCrew
from pydantic import BaseModel

load_dotenv()

class TaskInputs(BaseModel):
    query        : str
    lang         : str
    paper_content: str
    authors      : str
    title        : str
    journal      : str = ""
    year         : str

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
        return core_api.search(query, page)
    except Exception as e:
        return { "error": str(e) }

@app.get("/v1/paper/{paper_id}")
async def get_paper(paper_id: str):
    """
    Retrieve a paper by its ID.
    :param paper_id: The ID of the paper to retrieve.
    :return: Paper details.
    """
    try:
        return core_api.get_paper(paper_id)
    except Exception as e:
        return { "error": str(e) }

@app.post("/v1/crew/run")
async def run_crew(input_data: TaskInputs):
    """
    Run the full ResearchHelperCrew (Search → Summarizer → Citator).
    """
    try:
        crew = ResearchHelperCrew()
        outputs = crew.run_crew(input_data.dict())
        return outputs
    except Exception as e:
        return { "error": str(e) }
