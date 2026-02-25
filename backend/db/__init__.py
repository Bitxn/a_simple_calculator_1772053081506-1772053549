# runtime_template/backend/db/__init__.py
from .base import Base, engine, SessionLocal, get_db

__all__ = ["Base", "engine", "SessionLocal", "get_db"]

from .base import Base, engine
from . import models

def init_db():
    Base.metadata.create_all(bind=engine)
