from fastapi import FastAPI
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

# Register routers
app.include_router(donor_router)
app.include_router(search_router)
app.include_router(hospital_router)
app.include_router(inventory_router)
app.include_router(booking_router)
app.include_router(sos_router)


@app.get("/")
def home():
    return {
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