import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import models
from app.db.deps import get_current_user, get_db
from app.schemas import course as course_schema

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("/create", response_model=course_schema.CourseResponse)
def create_course(payload: course_schema.CourseCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can create courses")

    if str(current_user.id) != str(payload.creator_id):
        raise HTTPException(status_code=403, detail="Cannot create course for another creator")

    course = models.MicroCourse(
        creator_id=payload.creator_id,
        title=payload.title,
        description=payload.description,
        video_ids=payload.video_ids,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("/{course_id}", response_model=course_schema.CourseResponse)
def get_course(course_id: uuid.UUID, db: Session = Depends(get_db)):
    course = db.query(models.MicroCourse).filter(models.MicroCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/user/{creator_id}", response_model=List[course_schema.CourseResponse])
def get_courses_for_user(creator_id: uuid.UUID, db: Session = Depends(get_db)):
    return db.query(models.MicroCourse).filter(models.MicroCourse.creator_id == creator_id).all()
