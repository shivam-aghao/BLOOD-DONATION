from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.hospital_routes import router as hospital_router
from routes.inventory_routes import router as inventory_router
from routes.sos_routes import router as sos_router
from routes.booking_routes import router as booking_router
from routes.donor_routes import router as donor_router
from routes.search_routes import router as search_router


app = FastAPI(
    title="BloodConnect API",
    description="Backend API for blood donation, hospital inventory, SOS requests, bookings, donor registration and blood search",
    version="1.0.0"
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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