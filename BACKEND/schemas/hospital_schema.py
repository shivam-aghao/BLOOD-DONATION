from pydantic import BaseModel
from typing import Optional


class HospitalCreate(BaseModel):
    name: str
    city: str
    address: str
    contact: str
    email: Optional[str] = None
    hours: Optional[str] = "24/7 Emergency Blood Bank"


class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None
    hours: Optional[str] = "24/7 Emergency Blood Bank"