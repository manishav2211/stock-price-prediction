"""Fetch and prepare stock data from Yahoo Finance (yfinance) and store it in MongoDB."""
import json
from datetime import datetime, timezone

import pandas as pd
import yfinance as yf

from database import mongo


class TickerNotFound(ValueError):
    pass


def _now():
    return datetime.now(timezone.utc).isoformat()


def fetch_history(ticker: str, period: str = "5y") -> pd.DataFrame:
    """Download OHLCV data, clean it, sort by date. Raises TickerNotFound for invalid tickers."""
    ticker = ticker.upper().strip()
    if not ticker:
        raise ValueError("Ticker symbol is required.")
    try:
        df = yf.Ticker(ticker).history(period=period, auto_adjust=True)
    except Exception as e:  # noqa: BLE001
        raise RuntimeError(f"Could not fetch data from Yahoo Finance: {e}")
    if df is None or df.empty:
        raise TickerNotFound(f"No data found for ticker '{ticker}'. Check the symbol and try again.")

    df = df.reset_index()
    df["Date"] = pd.to_datetime(df["Date"]).dt.tz_localize(None)
    df = df[["Date", "Open", "High", "Low", "Close", "Volume"]]
    df = df.sort_values("Date").drop_duplicates("Date").reset_index(drop=True)
    df = df.ffill().dropna()  # missing value handling

    mongo.safe(
        mongo.stocks.replace_one,
        {"ticker": ticker, "period": period},
        {"ticker": ticker, "period": period, "updated_at": _now(), "data": to_records(df)},
        upsert=True,
    )
    return df


def to_records(df: pd.DataFrame) -> list:
    out = df.copy()
    out["Date"] = pd.to_datetime(out["Date"]).dt.strftime("%Y-%m-%d")
    return json.loads(out.round(4).to_json(orient="records"))  # NaN -> null


def get_stock_info(ticker: str) -> dict:
    ticker = ticker.upper().strip()
    df = fetch_history(ticker, "1y")
    last = df.iloc[-1]
    prev = df.iloc[-2] if len(df) > 1 else df.iloc[-1]
    name, currency = ticker, ""
    try:
        info = yf.Ticker(ticker).info
        name = info.get("shortName") or info.get("longName") or ticker
        currency = info.get("currency", "")
    except Exception:  # noqa: BLE001
        pass
    change = float(last["Close"] - prev["Close"])
    result = {
        "ticker": ticker,
        "name": name,
        "currency": currency,
        "latest_price": round(float(last["Close"]), 2),
        "change": round(change, 2),
        "percent_change": round(change / float(prev["Close"]) * 100, 2),
        "volume": int(last["Volume"]),
        "last_date": last["Date"].strftime("%Y-%m-%d"),
    }
    mongo.safe(mongo.search_history.insert_one, {"ticker": ticker, "name": name, "searched_at": _now()})
    return result


def get_indicators(ticker: str, limit: int = 250) -> list:
    df = fetch_history(ticker, "2y")
    df["MA20"] = df["Close"].rolling(20).mean()
    df["MA50"] = df["Close"].rolling(50).mean()
    return to_records(df[["Date", "Close", "MA20", "MA50", "Volume"]].tail(limit))
