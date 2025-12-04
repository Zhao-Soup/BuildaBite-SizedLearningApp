import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.db.session import Base, engine
from app.routers import ai, auth, courses, progress, videos

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_videos_path = os.path.join(os.path.dirname(__file__), "storage", "videos")
os.makedirs(static_videos_path, exist_ok=True)
app.mount("/static/videos", StaticFiles(directory=static_videos_path), name="videos")

app.include_router(auth.router)
app.include_router(videos.router)
app.include_router(courses.router)
app.include_router(progress.router)
app.include_router(ai.router)


@app.get("/")
def health_check():
    return {"status": "ok"}
