import uuid
from datetime import datetime

from sqlalchemy import ARRAY, Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="learner")

    videos = relationship("Video", back_populates="creator")
    courses = relationship("MicroCourse", back_populates="creator")


class Video(Base, TimestampMixin):
    __tablename__ = "videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    tags = Column(ARRAY(String), nullable=False, default=list)
    skill_level = Column(String(50), nullable=False)
    video_url = Column(String(500), nullable=False)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)

    creator = relationship("User", back_populates="videos")


class MicroCourse(Base, TimestampMixin):
    __tablename__ = "micro_courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    video_ids = Column(ARRAY(String), default=list)
    learners_enrolled = Column(Integer, default=0)

    creator = relationship("User", back_populates="courses")


class Progress(Base):
    __tablename__ = "progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("micro_courses.id"), nullable=True)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id"), nullable=False)
    completed = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
