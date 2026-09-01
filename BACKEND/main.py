from fastapi import FastAPI
<<<<<<< HEAD
from fastapi.middleware.cors import CORSMiddleware
from routes.donor_routes import router as donor_router
from routes.search_routes import router as search_router
from routes.hospital_routes import router as hospital_router
from routes.inventory_routes import router as inventory_router
from routes.booking_routes import router as booking_router
from routes.sos_routes import router as sos_router

app = FastAPI(
    title="Blood Availability Checker",
    description="Backend API for blood donor registration, blood availability search, hospitals, inventory and SOS requests",
=======

from BACKEND.routes.hospital_routes import router as hospital_router
from BACKEND.routes.inventory_routes import router as inventory_router
from BACKEND.routes.sos_routes import router as sos_router
from BACKEND.routes.booking_routes import router as booking_router
from BACKEND.routes.donor_routes import router as donor_router
from BACKEND.routes.search_routes import router as search_router


app = FastAPI(
    title="BloodConnect API",
    description="Backend API for blood donation, hospital inventory, SOS requests, bookings, donor registration and blood search",
>>>>>>> 193549310bf7b111bdc914f63a0f3746d4dd73fb
    version="1.0.0"
)

# Enable CORS for browser frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# Register routers
=======
# =========================
# ROUTES
# =========================

app.include_router(hospital_router)
app.include_router(inventory_router)
app.include_router(sos_router)
app.include_router(booking_router)
>>>>>>> 193549310bf7b111bdc914f63a0f3746d4dd73fb
app.include_router(donor_router)
app.include_router(search_router)
app.include_router(hospital_router)
app.include_router(inventory_router)
app.include_router(booking_router)
app.include_router(sos_router)


# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {
<<<<<<< HEAD
        "status": "online",
        "message": "Blood Availability Checker Backend is running",
        "endpoints": [
            "/donors",
            "/search/blood",
            "/hospitals",
            "/inventory",
            "/bookings",
            "/sos",
            "/docs"
        ]
    }


@app.get("/health")
def health():
    return {"status": "healthy", "service": "BloodConnect Backend"}
=======
        "message": "BloodConnect Backend is running successfully"
    }
>>>>>>> 193549310bf7b111bdc914f63a0f3746d4dd73fb
