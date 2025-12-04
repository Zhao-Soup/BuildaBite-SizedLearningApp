from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "learner"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True
