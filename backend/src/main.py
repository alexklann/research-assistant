from fastapi import FastAPI, Request, UploadFile, File,Query, HTTPException
from dotenv import load_dotenv
from core_api import CoreAPI
from crew import ResearchHelperCrew
from pydantic import BaseModel
import shutil
import os
import json
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

load_dotenv()
    
class TaskInputs(BaseModel):
    paper_content: str
    authors: str
    title: str
    journal: str = ""
    year: str

app = FastAPI()
core_api = CoreAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploaded_photos")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

PHOTO_DB_FILE = os.path.join(BASE_DIR, "photo_db.json")
if os.path.exists(PHOTO_DB_FILE):
    with open(PHOTO_DB_FILE, "r") as f:
        paper_photos = json.load(f)
else:
    paper_photos = {}

app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")

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

@app.get("/v1/paper/{paper_id}")
async def get_paper(paper_id: str):
    """
    Retrieve a paper by its ID.
    :param paper_id: The ID of the paper to retrieve.
    :return: Paper details.
    """
    try:
        paper = core_api.get_paper(paper_id)
        return paper
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
    
@app.post("/v1/upload-photo")
async def upload_photo(paper_id: str = Query(...), photo: UploadFile = File(...)):
    paper_folder = os.path.join(UPLOAD_FOLDER, paper_id)
    os.makedirs(paper_folder, exist_ok=True)

    file_location = os.path.join(paper_folder, photo.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)

    photo_url = f"/uploads/{paper_id}/{photo.filename}"

    paper_photos[paper_id] = [photo_url]
    with open(PHOTO_DB_FILE, "w") as f:
        json.dump(paper_photos, f)

    return JSONResponse(content={"url": photo_url})


@app.get("/v1/paper/{paper_id}/photos")
async def get_photos_for_paper(paper_id: str):
    photos = paper_photos.get(paper_id, [])
    print(f"[DEBUG] Returning photos for paper {paper_id}: {photos}")
    return {"photoUrls": photos}


@app.delete("/v1/paper/{paper_id}/photos")
async def delete_photo_from_paper(paper_id: str, photoUrl: str = Query(...)):
    if paper_id not in paper_photos or photoUrl not in paper_photos[paper_id]:
        raise HTTPException(status_code=404, detail="Photo not found")
    paper_photos[paper_id].remove(photoUrl)
    with open(PHOTO_DB_FILE, "w") as f:
        json.dump(paper_photos, f)
    return {"message": "Photo removed"}
