import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import models
from app.db.deps import get_current_user, get_db
from app.schemas import video as video_schema

router = APIRouter(prefix="/videos", tags=["videos"])

STORAGE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage", "videos"))
os.makedirs(STORAGE_ROOT, exist_ok=True)


@router.post("/upload", response_model=video_schema.VideoResponse)
def upload_video(
    title: str = Form(...),
    description: str | None = Form(None),
    tags: str = Form(""),
    skill_level: str = Form(...),
    creator=Depends(get_current_user),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if creator.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can upload videos")

    if file.content_type not in ("video/mp4", "video/webm", "video/quicktime"):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    filename = f"{uuid.uuid4()}.mp4"
    filepath = os.path.join(STORAGE_ROOT, filename)
    contents = file.file.read()
    with open(filepath, "wb") as buffer:
        buffer.write(contents)

    video = models.Video(
        creator_id=creator.id,
        title=title,
        description=description,
        tags=[tag.strip() for tag in tags.split(",") if tag.strip()],
        skill_level=skill_level,
        video_url=f"/static/videos/{filename}",
    )

    db.add(video)
    db.commit()
    db.refresh(video)
    return video


@router.get("/{video_id}", response_model=video_schema.VideoResponse)
def get_video(video_id: uuid.UUID, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.get("/feed", response_model=List[video_schema.VideoResponse])
def get_feed(limit: int = 15, db: Session = Depends(get_db)):
    return (
        db.query(models.Video)
        .order_by(models.Video.created_at.desc())
        .limit(limit)
        .all()
    )


class VideoIdPayload(BaseModel):
    video_id: uuid.UUID


@router.post("/increment-view")
def increment_view(payload: VideoIdPayload, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == payload.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    video.views += 1
    db.commit()
    return {"status": "ok", "views": video.views}


@router.post("/like")
def like_video(payload: VideoIdPayload, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == payload.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    video.likes += 1
    db.commit()
    return {"status": "ok", "likes": video.likes}
