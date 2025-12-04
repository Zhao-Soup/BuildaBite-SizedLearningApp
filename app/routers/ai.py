from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas import ai as ai_schema
from app.services import ai as ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/generate-summary", response_model=ai_schema.SummaryResponse)
def create_summary(payload: ai_schema.SummaryRequest):
    result = ai_service.generate_summary(payload.title, payload.tags, payload.transcript)
    return ai_schema.SummaryResponse(**result)


@router.post("/generate-quiz", response_model=ai_schema.QuizResponse)
def create_quiz(payload: ai_schema.QuizRequest):
    questions = ai_service.generate_quiz(payload.topic, payload.tags)
    return ai_schema.QuizResponse(questions=questions)


@router.post("/recommend-feed", response_model=ai_schema.RecommendationResponse)
def recommend_feed(payload: ai_schema.RecommendationRequest, db: Session = Depends(get_db)):
    videos = ai_service.recommend_videos(db, payload.recent_tags)
    return ai_schema.RecommendationResponse(video_ids=[video.id for video in videos])
