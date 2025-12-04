from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthUser(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    issued_at: datetime
