"""Model definitions: Linear Regression (baseline) and LSTM, plus metrics and forecasting helpers."""
import numpy as np
import tensorflow as tf
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from tensorflow.keras import layers, models, callbacks

from .preprocess import WINDOW


def build_linear() -> LinearRegression:
    return LinearRegression()


def build_lstm(window: int = WINDOW):
    tf.keras.utils.set_random_seed(42)
    model = models.Sequential([
        layers.Input(shape=(window, 1)),
        layers.LSTM(50, return_sequences=True),
        layers.Dropout(0.2),
        layers.LSTM(50),
        layers.Dropout(0.2),
        layers.Dense(1),
    ])
    model.compile(optimizer="adam", loss="mean_squared_error")
    return model


def fit_lstm(model, X_train, y_train, epochs: int = 20):
    stop = callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True)
    model.fit(
        X_train.reshape(-1, WINDOW, 1), y_train,
        epochs=epochs, batch_size=32, validation_split=0.1,
        shuffle=False, callbacks=[stop], verbose=0,
    )
    return model


def load_lstm(path: str):
    return models.load_model(path)


def metrics(y_true, y_pred) -> dict:
    return {
        "mae": round(float(mean_absolute_error(y_true, y_pred)), 4),
        "rmse": round(float(np.sqrt(mean_squared_error(y_true, y_pred))), 4),
        "r2": round(float(r2_score(y_true, y_pred)), 4),
    }


def forecast(predict_fn, last_window: np.ndarray, days: int) -> list:
    """Recursive multi-step forecast: each prediction is appended and used for the next step."""
    window = list(last_window)
    out = []
    for _ in range(days):
        p = float(predict_fn(np.array(window[-WINDOW:])))
        out.append(p)
        window.append(p)
    return out
