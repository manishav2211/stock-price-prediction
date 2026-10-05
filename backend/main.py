import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router

load_dotenv()

app = FastAPI(title="AI-Based Stock Price Prediction System", version="1.0.0")

origins = [os.getenv("FRONTEND_URL", "http://localhost:5173"), "http://127.0.0.1:5173"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])

app.include_router(router)


@app.get("/")
def root():
    return {"message": "Stock Price Prediction API is running. See /docs for the API documentation."}
