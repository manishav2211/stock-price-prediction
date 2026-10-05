# AI-Based Stock Price Prediction System

## 1. Project Overview
A full-stack web application that downloads historical stock data (Yahoo Finance), trains **Linear Regression** and **LSTM** models, predicts future closing prices (1, 7 or 30 days), and shows everything on a dark React dashboard. Data, predictions, model metrics and search history are stored in **MongoDB**.

## 2. Abstract
Stock prices form a time series that is noisy and hard to predict. This project uses the previous 60 closing prices to predict the next day's price with an LSTM neural network and compares it against a Linear Regression baseline. Data is scaled with MinMaxScaler, split chronologically (80/20, no shuffling) and evaluated with MAE, RMSE and R². Multi-day forecasts are produced recursively. A FastAPI backend exposes REST APIs and a React + Recharts dashboard visualizes prices, moving averages, forecasts and model comparison.

## 3. Problem Statement
Investors and students need an easy tool to analyse historical prices and see what machine-learning models estimate for the near future, together with honest measures of how accurate those models are.

## 4. Objectives
- Fetch and clean historical stock data.
- Train and compare a baseline (Linear Regression) and a deep-learning model (LSTM).
- Avoid data leakage and never shuffle time-series data.
- Predict 1 / 7 / 30 business days ahead.
- Store and display data, predictions and metrics.

## 5. Features
Stock search (AAPL, TSLA, RELIANCE.NS, ...) • price cards (latest price, change, %, volume) • price chart with MA20/MA50 • train & predict controls • interactive forecast chart • MAE/RMSE/R² cards • Actual vs Predicted chart • LSTM vs Linear comparison • prediction history • error handling and loading states.

## 6. Technology Stack
| Layer | Tools |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Recharts, Axios |
| Backend | Python, FastAPI, Pandas, NumPy, Scikit-learn, TensorFlow/Keras, yfinance |
| Database | MongoDB with PyMongo |

## 7. System Architecture
```
React Dashboard  <--HTTP/JSON-->  FastAPI  --> yfinance (Yahoo Finance)
                                     |-----> ML module (Linear Regression, LSTM)
                                     '-----> MongoDB (stock_prediction_db)
```

## 8. ML Methodology
1. Download 5 years of OHLCV data, sort by date, forward-fill missing values.
2. Use the **Close** price. Split chronologically: first 80% train, last 20% test.
3. Fit `MinMaxScaler` on the **training part only** (prevents data leakage).
4. Create sequences: 60 previous days -> next day.
5. Train Linear Regression (flattened 60 values) and LSTM (2 LSTM layers, dropout, early stopping, `shuffle=False`).
6. Evaluate on the test set in original price units: MAE, RMSE, R².
7. Forecast N days recursively (each prediction is fed back as input). Models are saved to `backend/saved_models/`.

All predictions come from the trained models — nothing is hardcoded.

## 9. Database Design
Database `stock_prediction_db`:
| Collection | Stores |
|---|---|
| `stocks` | `{ticker, period, updated_at, data:[{Date,Open,High,Low,Close,Volume}]}` |
| `predictions` | `{ticker, days, created_at, last_close, dates, linear_regression, lstm}` |
| `model_performance` | `{ticker, trained_at, linear_regression:{mae,rmse,r2}, lstm:{...}, actual_vs_predicted}` |
| `search_history` | `{ticker, name, searched_at}` |

If MongoDB is offline the API still works; saving/reading history is skipped and a warning is logged.

## 10. Installation
Requirements: **Python 3.10–3.12**, Node.js 18+, MongoDB running locally (or MongoDB Atlas).

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows   (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
cp .env.example .env           # Windows: copy .env.example .env

# Frontend
cd ../frontend
npm install
cp .env.example .env
```
Environment variables: `backend/.env` -> `MONGODB_URI=mongodb://localhost:27017`; `frontend/.env` -> `VITE_API_URL=http://localhost:8000`.

## 11. How to Run
```bash
# Terminal 1 - backend (http://localhost:8000, docs at /docs)
cd backend
uvicorn main:app --reload

# Terminal 2 - frontend (http://localhost:5173)
cd frontend
npm run dev
```
Open the app, search a ticker, click **Train models** (or just **Predict**, which trains automatically the first time; training takes ~1–3 minutes).

## 12. API Documentation
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stock/{ticker}` | Latest price, change, % change, volume |
| GET | `/api/history/{ticker}?period=1y` | OHLCV history (1mo, 3mo, 6mo, 1y, 2y, 5y) |
| GET | `/api/indicators/{ticker}` | Close, MA20, MA50, volume |
| POST | `/api/train` | Body `{"ticker":"AAPL","epochs":20}` – trains both models, returns metrics |
| POST | `/api/predict` | Body `{"ticker":"AAPL","days":7}` – days = 1, 7 or 30 |
| GET | `/api/model-performance/{ticker}` | Saved metrics and actual-vs-predicted data |
| GET | `/api/predictions/{ticker}` | Last 10 saved predictions |
| GET | `/api/search-history` | Last 10 searches |
| GET | `/api/health` | API and MongoDB status |

Errors: 404 invalid ticker, 400 bad input/not enough data, 502 Yahoo Finance unreachable.

## 13. Limitations
- Stock prices depend on news, economy and sentiment; only past prices are used.
- Recursive multi-day forecasts accumulate error, so 30-day predictions are less reliable.
- Yahoo Finance data can be delayed or temporarily unavailable.
- Models are trained per ticker and are not retrained automatically.

## 14. Future Scope
News/sentiment features, more indicators (RSI, MACD), GRU/Transformer models, scheduled retraining, user login and watchlists, deployment with Docker.

## 15. Conclusion
The project shows an end-to-end ML pipeline – data collection, preprocessing, model training, evaluation, storage and visualization – and demonstrates that deep-learning models must be compared against simple baselines. Predictions are for educational purposes only and are not financial advice.

---

## Viva Questions (20)
1. **What is LSTM?** A recurrent neural network with gates (forget, input, output) and a cell state that remembers long-term patterns and avoids the vanishing-gradient problem.
2. **Why LSTM for stock prediction?** Prices are sequential; LSTM learns dependencies across many past days.
3. **Why use Linear Regression as a baseline?** It is simple; if LSTM cannot beat it, the complex model adds no value.
4. **Can stock prices be predicted accurately?** Not reliably. Markets are influenced by news and randomness; models give estimates only.
5. **What is a time series?** Data points ordered in time, where past values influence future ones.
6. **Why not shuffle time-series data?** Shuffling breaks time order and lets the model see the future while training.
7. **What is data leakage?** When information from the test/future data influences training, giving unrealistically good results. Here the scaler is fitted on training data only and the split is chronological.
8. **Why MinMaxScaler?** LSTMs train better with inputs in the 0–1 range; it scales values using (x − min)/(max − min).
9. **What is the window size?** 60 – the number of previous days used to predict the next day.
10. **What is overfitting and how is it reduced?** Model memorizes training data and fails on new data. We use dropout, early stopping and a separate test set.
11. **What is MAE?** Mean Absolute Error – the average absolute difference between actual and predicted prices.
12. **What is RMSE?** Square root of the mean squared error; penalizes large errors more than MAE.
13. **What is R²?** Proportion of variance explained by the model; 1 is perfect, 0 equals predicting the mean, negative is worse than the mean.
14. **How are multi-day predictions made?** Recursively: each predicted price is appended to the window and used to predict the next day.
15. **What is yfinance?** A Python library that downloads market data from Yahoo Finance.
16. **Why MongoDB?** A flexible document database; stock records, predictions and metrics are stored naturally as JSON-like documents.
17. **What is FastAPI?** A modern Python web framework for building fast REST APIs with automatic validation and Swagger docs at `/docs`.
18. **What is CORS and why enabled?** Browser security rule; we allow the React origin (localhost:5173) to call the API on another port.
19. **Why React?** Component-based UI library; reusable components and state make a dynamic dashboard easy.
20. **What are MA20 and MA50?** 20-day and 50-day moving averages of closing price, used to see short- and medium-term trends.
