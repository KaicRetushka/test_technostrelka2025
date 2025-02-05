from pydantic import BaseModel, Field
from typing import List, Tuple

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
