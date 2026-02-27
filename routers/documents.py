"""
Documents API Router — File upload, listing, download, and deletion.
Files are stored in uploads/{case_id}/ with UUID-based filenames.
"""
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Document, Case
from schemas import DocumentResponse

UPLOADS_DIR = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".png", ".jpg", ".jpeg", ".webp"}

router = APIRouter(tags=["Documents"])


@router.post(
    "/api/cases/{case_id}/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_document(
    case_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a document to a specific case."""
    # Verify case exists
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    # Validate file extension
    _, ext = os.path.splitext(file.filename or "")
    ext = ext.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Create the upload directory for this case
    case_upload_dir = os.path.join(UPLOADS_DIR, case_id)
    os.makedirs(case_upload_dir, exist_ok=True)

    # Generate a unique filename
    stored_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(case_upload_dir, stored_filename)

    # Write file to disk
    contents = file.file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    # Save metadata to DB
    doc = Document(
        case_id=case_id,
        filename=stored_filename,
        original_filename=file.filename or "unknown",
        file_path=file_path,
        file_type=ext.lstrip("."),
        file_size=len(contents),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/api/cases/{case_id}/documents", response_model=list[DocumentResponse])
def list_documents(case_id: str, db: Session = Depends(get_db)):
    """List all documents for a specific case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    return case.documents


@router.get("/api/documents/{document_id}/download")
def download_document(document_id: str, db: Session = Depends(get_db)):
    """Download a document by its ID."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if not os.path.isfile(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk.")
    return FileResponse(
        path=doc.file_path,
        filename=doc.original_filename,
        media_type="application/octet-stream",
    )


@router.delete("/api/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    """Delete a document and remove the file from disk."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # Remove from disk
    if os.path.isfile(doc.file_path):
        os.remove(doc.file_path)

    db.delete(doc)
    db.commit()
