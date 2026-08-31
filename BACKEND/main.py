from fastapi import FastAPI

from routes.hospital_routes import router as hospital_router
from routes.inventory_routes import router as inventory_router
from routes.sos_routes import router as sos_router
from routes.booking_routes import router as booking_router


app = FastAPI(
    title="BloodConnect API",
    description="Blood donation and emergency blood management system",
    version="1.0.0"
)


app.include_router(hospital_router)
app.include_router(inventory_router)
app.include_router(sos_router)
app.include_router(booking_router)


@app.get("/")
def root():

    return {
        "message": "BloodConnect Backend is running"
    }


@app.get("/health")
def health():

    return {
        "status": "OK"
    }