import uuid

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db import models
from app.db.session import SessionLocal


SEED_VIDEOS = [
    {
        "title": "Intro to Neural Networks",
        "description": "Learn perceptrons in 60 seconds",
        "tags": ["ai", "ml", "neural-networks"],
        "skill_level": "intermediate",
        # YouTube Shorts-style URL (we will render via iframe on the frontend)
        "video_url": "https://www.youtube.com/embed/aircAruvnKk",
    },
    {
        "title": "What is Big O?",
        "description": "Understand complexity quickly",
        "tags": ["algorithms", "complexity"],
        "skill_level": "beginner",
        "video_url": "https://www.youtube.com/embed/D6xkbGLQesk",
    },
]


def run():
    db: Session = SessionLocal()
    try:
        creator = models.User(
            name="Demo Creator",
            email="creator@example.com",
            password_hash=hash_password("password123"),
            role="creator",
        )
        learner = models.User(
            name="Demo Learner",
            email="learner@example.com",
            password_hash=hash_password("password123"),
            role="learner",
        )
        db.add_all([creator, learner])
        db.commit()
        db.refresh(creator)
        db.refresh(learner)

        videos: list[models.Video] = []
        for data in SEED_VIDEOS:
            video = models.Video(
                creator_id=creator.id,
                views=10,
                likes=5,
                **data,
            )
            videos.append(video)
        db.add_all(videos)
        db.commit()

        course = models.MicroCourse(
            creator_id=creator.id,
            title="ML Crash Course",
            description="Micro-course of two videos",
            video_ids=[str(video.id) for video in videos],
            learners_enrolled=5,
        )
        db.add(course)
        db.commit()
        print("Seed data inserted.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
