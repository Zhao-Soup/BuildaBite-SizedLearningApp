from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, Field


class VideoBase(BaseModel):
    title: str
    description: str | None = None
    tags: List[str] = Field(default_factory=list)
    skill_level: str


class VideoCreate(VideoBase):
    video_url: str


class VideoUpload(VideoBase):
    creator_id: UUID


class VideoResponse(VideoBase):
    id: UUID
    creator_id: UUID
    video_url: str
    views: int
    likes: int
    created_at: datetime

    class Config:
        orm_mode = True
