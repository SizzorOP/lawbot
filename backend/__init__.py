# This file marks the backend directory as a Python package.

# Import the FastAPI app so that `uvicorn lawbot.backend.app:app` works correctly.
from .app import app  # noqa: F401