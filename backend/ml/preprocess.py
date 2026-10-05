"""Pre-processing: scaling, sequence creation and a chronological train/test split."""
import numpy as np
from sklearn.preprocessing import MinMaxScaler

WINDOW = 60          # use the previous 60 closing prices to predict the next one
TRAIN_RATIO = 0.8    # first 80% of the timeline = train, last 20% = test


def prepare(close: np.ndarray):
    """Returns scaler, X_train, y_train, X_test, y_test, split_index.

    No shuffling (time order is kept) and the scaler is fitted ONLY on the training part,
    so no information from the future leaks into training (no data leakage).
    """
    n = len(close)
    if n < WINDOW + 100:
        raise ValueError("Not enough historical data to train the models for this ticker.")
    split = int(n * TRAIN_RATIO)

    scaler = MinMaxScaler().fit(close[:split].reshape(-1, 1))
    scaled = scaler.transform(close.reshape(-1, 1)).ravel()

    X, y = [], []
    for i in range(WINDOW, n):
        X.append(scaled[i - WINDOW:i])
        y.append(scaled[i])
    X, y = np.array(X), np.array(y)

    cut = split - WINDOW  # first sample whose target day belongs to the test period
    return scaler, X[:cut], y[:cut], X[cut:], y[cut:], split
