import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

export default function PriceChart({ data }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 font-semibold">Historical Price with MA20 &amp; MA50</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="Date" stroke="#64748b" minTickGap={40} tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
            <Legend />
            <Line type="monotone" dataKey="Close" stroke="#6366f1" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="MA20" stroke="#22c55e" dot={false} />
            <Line type="monotone" dataKey="MA50" stroke="#f59e0b" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
