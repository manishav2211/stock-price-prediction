function ModelBox({ title, m, color }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h4 className={`mb-3 font-semibold ${color}`}>{title}</h4>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[["MAE", m.mae], ["RMSE", m.rmse], ["R²", m.r2]].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-slate-950 p-3">
            <p className="text-xs text-slate-400">{k}</p>
            <p className="text-lg font-semibold">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MetricsCards({ perf }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">Model Performance (test set)</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <ModelBox title="LSTM" m={perf.lstm} color="text-indigo-400" />
        <ModelBox title="Linear Regression (baseline)" m={perf.linear_regression} color="text-amber-400" />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Trained on {perf.train_samples} samples, tested on {perf.test_samples} later samples • window {perf.window} days •
        epochs {perf.epochs}
      </p>
    </div>
  );
}
