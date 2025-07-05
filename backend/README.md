# Python Backend
The backend for our research assistant app.

## Running
Firstly, create a virtual environment:

```
python -m venv .venv
# Then activate
source .venv/bin/activate # unix
source .venv\Scripts\activate # windows
```

Then, install all necessary packages:
```
python -m pip install -r requirements.txt
```

After that, you can start up the server:
> [!CAUTION]
> Make sure you run this command from the root of this folder.
> Otherwise, python might not be able to find all modules.
```
fastapi dev src/main.py # For use with web
fastapi run src/main.py # If you use iOS. Hosts on 0.0.0.0 instead.
```

## Environment Variables
The backend requires a .env file in the root of the folder with the following fields:  
```
CORE_API_KEY = "" # API key for the CORE Research Paper API
API_BASE = "http://localhost:11434" # OLLAMA URL
```