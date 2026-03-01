"""
Documents API Router — File upload, listing, download, and deletion.
Files are stored in uploads/{case_id}/ with UUID-based filenames.
"""
import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Document, Case
from schemas import DocumentResponse, DocumentUpdate

UPLOADS_DIR = "uploads"
ALLOWED_EXTENSIONS = {
    # Documents
    ".pdf", ".docx", ".doc", ".txt", ".csv",
    # Photos
    ".png", ".jpg", ".jpeg", ".webp", ".gif",
    # Videos
    ".mp4", ".mov", ".avi", ".mkv",
    # Audio
    ".mp3", ".wav", ".m4a", ".aac",
    # Quiz & Flashcards (often json or csv/txt format)
    ".json"
}

router = APIRouter(tags=["Documents"])

@router.get("/api/documents", response_model=list[DocumentResponse])
def list_all_documents(db: Session = Depends(get_db)):
    """List all documents globally, newest first."""
    docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()
    return docs

@router.post(
    "/api/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_global_document(
    file: UploadFile = File(...),
    case_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Upload a document globally, optionally attaching it to a case."""
    if case_id:
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found.")

    _, ext = os.path.splitext(file.filename or "")
    ext = ext.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    folder_name = case_id if case_id else "global"
    upload_dir = os.path.join(UPLOADS_DIR, folder_name)
    os.makedirs(upload_dir, exist_ok=True)

    stored_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, stored_filename)

    contents = file.file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

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

@router.patch("/api/documents/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: str,
    update_data: DocumentUpdate,
    db: Session = Depends(get_db),
):
    """Update a document's metadata (e.g., case_id)."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if hasattr(update_data, 'case_id') and update_data.case_id is not None:
        case = db.query(Case).filter(Case.id == update_data.case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found.")
        doc.case_id = update_data.case_id

    db.commit()
    db.refresh(doc)
    return doc


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


@router.patch("/api/documents/{document_id}/analyze", response_model=DocumentResponse)
def analyze_document(
    document_id: str,
    db: Session = Depends(get_db),
):
    """(Simulated) Generate transcript and summary for audio/video documents."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if not doc.file_type or doc.file_type not in ["mp3", "wav", "m4a", "aac", "mp4", "mov", "avi", "mkv", "webm"]:
        raise HTTPException(status_code=400, detail="Document format not supported for transcription.")

    # -------------------------------------------------------------
    # TODO: In production, integrate Audio/Speech-to-text API here.
    # e.g., OpenAI Whisper + GPT-4o for summary.
    # -------------------------------------------------------------
    
    simulated_transcript = '''[00:00:00] Speaker 1: "Okay, let's start the meeting. Can everyone hear me?"
[00:00:05] Speaker 2: "Yes, loud and clear."
[00:00:08] Speaker 1: "Great. So the purpose of this call is to review the recent case filings and discuss our strategy moving forward."
[00:00:15] Speaker 2: "I've reviewed the documents, and I think we have a strong precedent to cite regarding the discovery requests. However, we need to file a motion to compel by next Friday."
[00:00:25] Speaker 1: "Agreed. I'll draft the motion and send it to you for review by Wednesday."
[00:00:30] Speaker 2: "Perfect. We also need to coordinate with the witnesses. I have their contact info here."
[00:00:35] Speaker 1: "Okay, let's schedule out time to prep them on Monday."
'''

    simulated_summary = '''**Meeting Summary**
- **Date:** {timestamp}
- **Type:** Strategic Review Call

**Key Discussion Points:**
1. **Case Filings Review:** The team discussed recent case filings and concluded there is a strong precedent concerning discovery requests.
2. **Motion to Compel:** A motion to compel must be filed by next Friday. Speaker 1 will prepare the initial draft by Wednesday for Speaker 2’s review.
3. **Witness Preparation:** The team agreed to schedule witness preparation sessions for the upcoming Monday.

**Action Items:**
- [ ] Speaker 1: Draft Motion to Compel by Wednesday.
- [ ] Speaker 2: Review Motion to Compel draft upon receipt.
- [ ] Joint: Schedule and conduct witness preparation on Monday.
'''.format(timestamp=doc.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"))

    doc.transcript = simulated_transcript
    doc.summary = simulated_summary
    
    db.commit()
    db.refresh(doc)
    return doc

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
