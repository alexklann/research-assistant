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
> Make sure you run this command from the root of this repository.
> Otherwise, python might not be able to find all modules.
```
fastapi dev src/main.py
```