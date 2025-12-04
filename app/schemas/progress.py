from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ProgressUpdate(BaseModel):
    user_id: UUID
    course_id: UUID | None = None
    video_id: UUID
    completed: bool


class ProgressResponse(BaseModel):
    id: UUID
    user_id: UUID
    course_id: UUID | None = None
    video_id: UUID
    completed: bool
    updated_at: datetime

    class Config:
        orm_mode = True
