import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

export default function ModelComparison({ perf }) {
  const a = perf.actual_vs_predicted;
  const data = a.dates.map((date, i) => ({
    date,
    actual: a.actual[i],
    lstm: a.lstm[i],
    linear_regression: a.linear_regression[i],
  }));
  const rows = [["MAE", "mae", true], ["RMSE", "rmse", true], ["R²", "r2", false]];
  const best = (key, lowerBetter) =>
    (lowerBetter ? perf.lstm[key] < perf.linear_regression[key] : perf.lstm[key] > perf.linear_regression[key])
      ? "LSTM" : "Linear Regression";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 font-semibold">Actual vs Predicted (test period)</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" minTickGap={40} tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
            <Legend />
            <Line dataKey="actual" name="Actual" stroke="#94a3b8" dot={false} strokeWidth={2} />
            <Line dataKey="lstm" name="LSTM" stroke="#6366f1" dot={false} />
            <Line dataKey="linear_regression" name="Linear Regression" stroke="#f59e0b" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <table className="mt-4 w-full text-left text-sm">
        <thead className="text-slate-400">
          <tr><th className="py-1">Metric</th><th>LSTM</th><th>Linear Regression</th><th>Better</th></tr>
        </thead>
        <tbody>
          {rows.map(([label, key, lower]) => (
            <tr key={key} className="border-t border-slate-800">
              <td className="py-1">{label}</td>
              <td>{perf.lstm[key]}</td>
              <td>{perf.linear_regression[key]}</td>
              <td className="text-emerald-400">{best(key, lower)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
