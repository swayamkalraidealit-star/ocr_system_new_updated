from typing import Any, Annotated, Optional
from pydantic import BaseModel, Field, EmailStr, BeforeValidator, PlainSerializer, WithJsonSchema
from bson import ObjectId

def validate_object_id(v: Any) -> ObjectId:
    if isinstance(v, ObjectId):
        return v
    if ObjectId.is_valid(v):
        return ObjectId(v)
    raise ValueError("Invalid ObjectId")

PyObjectId = Annotated[
    ObjectId,
    BeforeValidator(validate_object_id),
    PlainSerializer(lambda x: str(x), return_type=str),
    WithJsonSchema({"type": "string"}, mode='serialization')
]

class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=ObjectId, alias="_id")
    username: str = Field(...)
    email: EmailStr = Field(...)
    hashed_password: str = Field(...)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True

class UserInDB(UserModel):
    pass

class ScanHistoryModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=ObjectId, alias="_id")
    user_id: PyObjectId = Field(...)
    filename: str = Field(...)
    calculated_weight_kg: float = Field(...)
    extracted_data: dict = Field(...)
    timestamp: str = Field(...)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True
