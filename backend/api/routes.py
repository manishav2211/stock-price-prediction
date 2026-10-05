"""REST API endpoints."""
from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from database import mongo
from ml import trainer
from services import stock_service as ss

router = APIRouter(prefix="/api")


class TrainRequest(BaseModel):
    ticker: str
    epochs: int = Field(20, ge=1, le=100)


class PredictRequest(BaseModel):
    ticker: str
    days: Literal[1, 7, 30] = 7


def run(fn, *args, **kwargs):
    """Call a function and convert Python errors into proper HTTP errors."""
    try:
        return fn(*args, **kwargs)
    except ss.TickerNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@router.get("/health")
def health():
    return {"status": "ok", "mongodb": mongo.is_connected()}


@router.get("/stock/{ticker}")
def stock(ticker: str):
    return run(ss.get_stock_info, ticker)


@router.get("/history/{ticker}")
def history(ticker: str, period: str = Query("1y", pattern="^(1mo|3mo|6mo|1y|2y|5y)$")):
    df = run(ss.fetch_history, ticker, period)
    return {"ticker": ticker.upper(), "period": period, "data": ss.to_records(df)}


@router.get("/indicators/{ticker}")
def indicators(ticker: str, limit: int = Query(250, ge=20, le=500)):
    return run(ss.get_indicators, ticker, limit)


@router.post("/train")
def train(req: TrainRequest):
    return run(trainer.train, req.ticker, req.epochs)


@router.post("/predict")
def predict(req: PredictRequest):
    return run(trainer.predict, req.ticker, req.days)


@router.get("/model-performance/{ticker}")
def model_performance(ticker: str):
    doc = mongo.safe(mongo.model_performance.find_one, {"ticker": ticker.upper()}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Models not trained yet for this ticker.")
    return doc


@router.get("/predictions/{ticker}")
def predictions(ticker: str):
    cursor = mongo.safe(
        lambda: mongo.predictions.find({"ticker": ticker.upper()}, {"_id": 0}).sort("created_at", -1).limit(10),
        default=[],
    )
    return list(cursor)


@router.get("/search-history")
def search_history():
    cursor = mongo.safe(
        lambda: mongo.search_history.find({}, {"_id": 0}).sort("searched_at", -1).limit(10), default=[]
    )
    return list(cursor)
