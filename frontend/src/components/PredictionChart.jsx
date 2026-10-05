import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

export default function PredictionChart({ series, forecast }) {
  // last 60 days of real prices + forecast from both models
  const hist = series.slice(-60).map((d) => ({ date: d.Date, actual: d.Close }));
  const last = hist[hist.length - 1];
  const data = [
    ...hist.slice(0, -1),
    { ...last, linear_regression: last.actual, lstm: last.actual }, // connect the lines
    ...forecast.dates.map((date, i) => ({
      date,
      linear_regression: forecast.linear_regression[i],
      lstm: forecast.lstm[i],
    })),
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 font-semibold">Predicted Prices — next {forecast.days} day(s)</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" minTickGap={30} tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" domain={["dataMin", "dataMax"]} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
            <Legend />
            <Line dataKey="actual" name="Actual" stroke="#94a3b8" dot={false} strokeWidth={2} />
            <Line dataKey="lstm" name="LSTM" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line dataKey="linear_regression" name="Linear Regression" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr><th className="py-1">Date</th><th>LSTM</th><th>Linear Regression</th></tr>
          </thead>
          <tbody>
            {forecast.dates.map((d, i) => (
              <tr key={d} className="border-t border-slate-800">
                <td className="py-1">{d}</td><td>{forecast.lstm[i]}</td><td>{forecast.linear_regression[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
