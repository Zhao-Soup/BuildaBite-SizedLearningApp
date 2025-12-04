from typing import List
from uuid import UUID

from pydantic import BaseModel


class SummaryRequest(BaseModel):
    title: str
    tags: List[str]
    transcript: str | None = None


class SummaryResponse(BaseModel):
    summary: str
    key_points: List[str]


class QuizRequest(BaseModel):
    topic: str
    tags: List[str]


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer: str


class QuizResponse(BaseModel):
    questions: List[QuizQuestion]


class RecommendationRequest(BaseModel):
    user_id: UUID | None = None
    recent_tags: List[str] = []


class RecommendationResponse(BaseModel):
    video_ids: List[UUID]
