import { useState } from "react";
import StockSearch from "../components/StockSearch.jsx";
import StockCards from "../components/StockCards.jsx";
import PriceChart from "../components/PriceChart.jsx";
import PredictionChart from "../components/PredictionChart.jsx";
import MetricsCards from "../components/MetricsCards.jsx";
import ModelComparison from "../components/ModelComparison.jsx";
import PredictionHistory from "../components/PredictionHistory.jsx";
import {
  getStock, getIndicators, getPerformance, getPredictions, trainModels, predict, errMsg,
} from "../services/api.js";

export default function Dashboard() {
  const [info, setInfo] = useState(null);
  const [series, setSeries] = useState([]);
  const [perf, setPerf] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const refreshExtras = (t) => {
    getPerformance(t).then(setPerf).catch(() => setPerf(null));
    getPredictions(t).then(setHistory).catch(() => setHistory([]));
  };

  const search = async (ticker) => {
    setLoading(true);
    setError("");
    setForecast(null);
    setPerf(null);
    try {
      const [i, s] = await Promise.all([getStock(ticker), getIndicators(ticker)]);
      setInfo(i);
      setSeries(s);
      refreshExtras(i.ticker);
    } catch (e) {
      setInfo(null);
      setSeries([]);
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  const train = async () => {
    setBusy("Training Linear Regression and LSTM… this can take a few minutes.");
    setError("");
    try {
      setPerf(await trainModels(info.ticker, 20));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy("");
    }
  };

  const runPredict = async () => {
    setBusy(perf ? "Generating forecast…" : "Models not trained yet — training first, then predicting (may take a few minutes)…");
    setError("");
    try {
      setForecast(await predict(info.ticker, days));
      refreshExtras(info.ticker);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-6">
      <StockSearch onSearch={search} loading={loading} />

      {error && (
        <div className="rounded-lg border border-rose-800 bg-rose-950 p-3 text-sm text-rose-300">⚠ {error}</div>
      )}
      {loading && <p className="text-slate-400">Fetching stock data…</p>}

      {info && !loading && (
        <>
          <StockCards info={info} />
          <PriceChart data={series} />

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="mb-3 font-semibold">Prediction Controls</h3>
            <div className="flex flex-wrap items-center gap-3">
              {[1, 7, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    days === d ? "border-indigo-500 bg-indigo-600" : "border-slate-700 hover:border-indigo-500"
                  }`}
                >
                  {d} day{d > 1 ? "s" : ""}
                </button>
              ))}
              <button onClick={runPredict} disabled={!!busy}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50">
                Predict
              </button>
              <button onClick={train} disabled={!!busy}
                className="rounded-lg border border-slate-600 px-5 py-2 text-sm hover:border-indigo-500 disabled:opacity-50">
                {perf ? "Retrain models" : "Train models"}
              </button>
            </div>
            {busy && <p className="mt-3 animate-pulse text-sm text-amber-300">{busy}</p>}
            <p className="mt-3 text-xs text-slate-500">
              Predictions are estimates for educational purposes and are not guaranteed financial advice.
            </p>
          </div>

          {forecast && <PredictionChart series={series} forecast={forecast} />}
          {perf && (
            <>
              <MetricsCards perf={perf} />
              <ModelComparison perf={perf} />
            </>
          )}
          <PredictionHistory items={history} />
        </>
      )}
    </div>
  );
}
