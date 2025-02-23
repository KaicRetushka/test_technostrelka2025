from pydantic import BaseModel, Field
from typing import List, Tuple, Optional

class PydanticRegistration(BaseModel):
    login: str = Field(max_length=100)
    password: str = Field(max_length=100)
    name: str = Field(max_length=100)
    surname: str = Field(max_length=100)

class PydanticEnter(BaseModel):
    login: str = Field(max_length=100)
    password: str = Field(max_length=100)

class PydanticDetail(BaseModel):
    detail: str

class BodyAddPolyline(BaseModel):
    p_name: str = Field(max_length=100)
    p_text: str
    p_arr: List[Tuple[float, float]]
    p_color: str = Field(max_length=100)
    is_public: bool

class PydanticDetailPolylineId(BaseModel):
    detail: str
    p_id: int

class InfoPolyline(BaseModel):
    p_id: int
    p_name: str = Field(max_length=100)
    p_text: str
    p_arr: List[Tuple[float, float]]
    p_color: str = Field(max_length=100)

class BodyCom(BaseModel):
    p_id: int
    comment: str

class InfoCom(BaseModel):
    login_user: str
    c_text: str

class ResponseInfoUser(BaseModel):
    login: str = Field(max_length=100)
    password: str = Field(max_length=100)
    name: str = Field(max_length=100)
    surname: str = Field(max_length=100)
    role: str = Field(max_length=100)
    viseted_polylines_public: List[int]

class MarksPolyline(BaseModel):
    count_like: int
    count_dislike: int

class BodyLike(BaseModel):
    is_like: Optional[int] = None

class BodyChangePolyline(BaseModel):
    is_public: bool
    p_id: int
    p_name: Optional[str] = None
    p_text: Optional[str] = None
    p_arr: Optional[List[Tuple[float, float]]] = None
    p_color: Optional[str] = None
    photos_arr: Optional[List[str]] = None

class ReturnHistoryPolyline(BaseModel):
    id: int
    p_name: str
    p_text: str
    p_arr: List[Tuple[float, float]]
    p_color: str
    photos_arr: List[str]