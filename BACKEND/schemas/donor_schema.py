from pydantic import BaseModel
from typing import Optional


class DonorCreate(BaseModel):
    name: str
    age: int
    gender: str
    blood_group: str
    phone: str
    email: str
    city: str
    address: Optional[str] = None
    donated_before: str
    last_donation: Optional[str] = None
    availability: str
    preferred_hospital: Optional[str] = None
    agreement: bool


class DonorResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    blood_group: str
    phone: str
    email: str
    city: str
    address: Optional[str] = None
    donated_before: str
    last_donation: Optional[str] = None
    availability: str
    preferred_hospital: Optional[str] = None
    agreement: bool
    available: bool