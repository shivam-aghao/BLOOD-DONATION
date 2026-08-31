from fastapi import FastAPI
from routes.donor_routes import router as donor_router
from routes.search_routes import router as search_router

app = FastAPI(
    title="Blood Availability Checker",
    description="Backend API for blood donor registration and blood availability search",
    version="1.0.0"
)


app.include_router(donor_router)
app.include_router(search_router)


@app.get("/")
def home():
    return {
        "message": "Blood Availability Checker Backend is running"
    }