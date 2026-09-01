from fastapi import FastAPI, Request, Response
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
# UNIVERSAL CORS MIDDLEWARE
# Supports file:// (Origin: null), localhost, and all ports
# =========================

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response(status_code=204)
    else:
        response = await call_next(request)
    origin = request.headers.get("origin") or "*"
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
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
# HOME & HEALTH CHECKS
# =========================

@app.get("/")
def home():
    return {
        "status": "online",
        "message": "BloodConnect Backend is running successfully"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "BloodConnect Backend"
    }