function Card({ label, value, color = "text-slate-100" }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export default function StockCards({ info }) {
  const up = info.change >= 0;
  const color = up ? "text-emerald-400" : "text-rose-400";
  const sign = up ? "+" : "";
  return (
    <div>
      <h2 className="mb-3 text-xl font-semibold">
        {info.name} <span className="text-slate-400">({info.ticker})</span>
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label={`Latest price ${info.currency}`} value={info.latest_price.toLocaleString()} />
        <Card label="Price change" value={`${sign}${info.change}`} color={color} />
        <Card label="% change" value={`${sign}${info.percent_change}%`} color={color} />
        <Card label="Volume" value={info.volume.toLocaleString()} />
      </div>
      <p className="mt-2 text-xs text-slate-500">Last trading day: {info.last_date}</p>
    </div>
  );
}
