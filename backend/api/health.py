# runtime_template/backend/api/health.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/health", tags=["health"])

@router.get("/")
def health():
    return {"status": "ok"}