from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, Field


class CourseBase(BaseModel):
    title: str
    description: str | None = None
    video_ids: List[str] = Field(default_factory=list)


class CourseCreate(CourseBase):
    creator_id: UUID


class CourseResponse(CourseBase):
    id: UUID
    creator_id: UUID
    learners_enrolled: int
    created_at: datetime

    class Config:
        orm_mode = True
