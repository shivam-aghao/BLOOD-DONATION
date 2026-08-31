from fastapi import FastAPI

from BACKEND.routes.hospital_routes import router as hospital_router
from BACKEND.routes.inventory_routes import router as inventory_router
from BACKEND.routes.sos_routes import router as sos_router
from BACKEND.routes.booking_routes import router as booking_router
from BACKEND.routes.donor_routes import router as donor_router
from BACKEND.routes.search_routes import router as search_router


app = FastAPI(
    title="BloodConnect API",
    description="Backend API for blood donation, hospital inventory, SOS requests, bookings, donor registration and blood search",
    version="1.0.0"
)


# =========================
# ROUTES
# =========================

app.include_router(hospital_router)
app.include_router(inventory_router)
app.include_router(sos_router)
app.include_router(booking_router)
app.include_router(donor_router)
app.include_router(search_router)


# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {
        "message": "BloodConnect Backend is running successfully"
    }