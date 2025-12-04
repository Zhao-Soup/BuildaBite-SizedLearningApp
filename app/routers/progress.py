import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import models
from app.db.deps import get_current_user, get_db
from app.schemas import progress as progress_schema

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/update", response_model=progress_schema.ProgressResponse)
def update_progress(payload: progress_schema.ProgressUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if str(current_user.id) != str(payload.user_id):
        raise HTTPException(status_code=403, detail="Cannot update other user progress")

    record = (
        db.query(models.Progress)
        .filter(
            models.Progress.user_id == payload.user_id,
            models.Progress.video_id == payload.video_id,
        )
        .first()
    )
    if record:
        record.completed = payload.completed
    else:
        record = models.Progress(
            user_id=payload.user_id,
            course_id=payload.course_id,
            video_id=payload.video_id,
            completed=payload.completed,
        )
        db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/user/{user_id}/course/{course_id}")
def get_progress(user_id: uuid.UUID, course_id: uuid.UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if str(current_user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="Cannot view other user progress")

    progress = (
        db.query(models.Progress)
        .filter(models.Progress.user_id == user_id, models.Progress.course_id == course_id)
        .all()
    )
    completed = sum(1 for record in progress if record.completed)
    return {"completed": completed, "total": len(progress)}
