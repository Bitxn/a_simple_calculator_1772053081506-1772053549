from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.responses import StreamingResponse
from db.base import get_db
import csv, io

router = APIRouter(prefix="/db/export", tags=["Export"])


@router.get("/csv/{table_name}")
def export_csv(table_name: str, db: Session = Depends(get_db)):

    rows = db.execute(text(f"SELECT * FROM {table_name}")).fetchall()
    if not rows:
        raise HTTPException(404, "No data")

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(rows[0]._mapping.keys())

    for row in rows:
        writer.writerow(row)

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={table_name}.csv"}
    )
