"""Training, evaluation and prediction pipeline."""
import os
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd

from database import mongo
from services import stock_service as ss
from . import models as mdl
from . import preprocess as pp

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)


def _paths(ticker: str):
    base = os.path.join(MODEL_DIR, ticker.replace("^", "_").replace("/", "_"))
    return base + "_linear.joblib", base + "_lstm.keras", base + "_scaler.joblib"


def _now():
    return datetime.now(timezone.utc).isoformat()


def train(ticker: str, epochs: int = 20) -> dict:
    ticker = ticker.upper().strip()
    df = ss.fetch_history(ticker, "5y")
    close = df["Close"].values.astype(float)
    scaler, X_tr, y_tr, X_te, y_te, split = pp.prepare(close)

    linear = mdl.build_linear().fit(X_tr, y_tr)
    lstm = mdl.fit_lstm(mdl.build_lstm(), X_tr, y_tr, epochs)

    inv = lambda a: scaler.inverse_transform(np.asarray(a).reshape(-1, 1)).ravel()
    actual = inv(y_te)
    lin_pred = inv(linear.predict(X_te))
    lstm_pred = inv(lstm.predict(X_te.reshape(-1, pp.WINDOW, 1), verbose=0))

    lin_path, lstm_path, sc_path = _paths(ticker)
    joblib.dump(linear, lin_path)
    lstm.save(lstm_path)
    joblib.dump(scaler, sc_path)

    r = lambda a: np.round(a, 2).tolist()
    doc = {
        "ticker": ticker,
        "trained_at": _now(),
        "window": pp.WINDOW,
        "epochs": epochs,
        "train_samples": int(len(X_tr)),
        "test_samples": int(len(X_te)),
        "linear_regression": mdl.metrics(actual, lin_pred),
        "lstm": mdl.metrics(actual, lstm_pred),
        "actual_vs_predicted": {
            "dates": df["Date"].iloc[split:].dt.strftime("%Y-%m-%d").tolist(),
            "actual": r(actual),
            "linear_regression": r(lin_pred),
            "lstm": r(lstm_pred),
        },
    }
    mongo.safe(mongo.model_performance.replace_one, {"ticker": ticker}, dict(doc), upsert=True)
    return doc


def predict(ticker: str, days: int) -> dict:
    ticker = ticker.upper().strip()
    lin_path, lstm_path, sc_path = _paths(ticker)
    if not all(os.path.exists(p) for p in (lin_path, lstm_path, sc_path)):
        train(ticker)  # train automatically the first time

    linear = joblib.load(lin_path)
    lstm = mdl.load_lstm(lstm_path)
    scaler = joblib.load(sc_path)

    df = ss.fetch_history(ticker, "2y")
    close = df["Close"].values.astype(float)
    last = scaler.transform(close[-pp.WINDOW:].reshape(-1, 1)).ravel()

    lin_f = mdl.forecast(lambda w: linear.predict(w.reshape(1, -1))[0], last, days)
    lstm_f = mdl.forecast(lambda w: lstm.predict(w.reshape(1, -1, 1), verbose=0)[0, 0], last, days)
    inv = lambda v: np.round(scaler.inverse_transform(np.array(v).reshape(-1, 1)).ravel(), 2).tolist()

    dates = pd.bdate_range(df["Date"].iloc[-1] + pd.Timedelta(days=1), periods=days)
    result = {
        "ticker": ticker,
        "days": days,
        "created_at": _now(),
        "last_close": round(float(close[-1]), 2),
        "dates": [d.strftime("%Y-%m-%d") for d in dates],
        "linear_regression": inv(lin_f),
        "lstm": inv(lstm_f),
    }
    mongo.safe(mongo.predictions.insert_one, dict(result))
    return result
