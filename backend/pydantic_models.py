from pydantic import BaseModel, Field

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