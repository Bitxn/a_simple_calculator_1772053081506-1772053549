from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from db.base import get_db

router = APIRouter(prefix="/db", tags=["Database"])


@router.get("/tables")
def list_tables(db: Session = Depends(get_db)):
    """
    Returns all SQLite tables in this generated app database
    """
    result = db.execute(text("""
        SELECT name FROM sqlite_master
        WHERE type='table'
        ORDER BY name
    """)).fetchall()

    return {"tables": [r[0] for r in result]}


@router.get("/table/{table_name}")
def preview_table(table_name: str, db: Session = Depends(get_db)):
    """
    Returns first 100 rows of a table
    """

    # Validate table exists
    valid = db.execute(text("""
        SELECT name FROM sqlite_master
        WHERE type='table'
    """)).fetchall()

    valid_tables = [t[0] for t in valid]

    if table_name not in valid_tables:
        raise HTTPException(status_code=400, detail="Invalid table name")

    rows = db.execute(text(f"SELECT * FROM {table_name} LIMIT 100")).fetchall()

    return {
        "table": table_name,
        "rows": [dict(r._mapping) for r in rows]
    }
