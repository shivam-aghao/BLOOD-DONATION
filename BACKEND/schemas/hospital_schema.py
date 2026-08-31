from pydantic import BaseModel, EmailStr


class HospitalCreate(BaseModel):
    name: str
    city: str
    address: str
    contact: str
    email: EmailStr
    hours: str = "24/7 Emergency Blood Bank"


class HospitalUpdate(BaseModel):
    name: str
    city: str
    address: str
    contact: str
    email: EmailStr
    hours: str = "24/7 Emergency Blood Bank"