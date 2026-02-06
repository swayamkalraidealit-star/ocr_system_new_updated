from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, scans

app = FastAPI(title="OCR System Backend")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(scans.router, prefix="/analysis", tags=["analysis"])

@app.get("/")
def read_root():
    return {"message": "Welcome to OCR System Backend"}
    