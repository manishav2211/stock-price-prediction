export default function PredictionHistory({ items }) {
  if (!items.length) return null;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 font-semibold">Prediction History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr><th className="py-1">Created</th><th>Horizon</th><th>Last close</th><th>LSTM (final)</th><th>Linear (final)</th></tr>
          </thead>
          <tbody>
            {items.map((p, i) => (
              <tr key={i} className="border-t border-slate-800">
                <td className="py-1">{new Date(p.created_at).toLocaleString()}</td>
                <td>{p.days} day(s)</td>
                <td>{p.last_close}</td>
                <td>{p.lstm[p.lstm.length - 1]}</td>
                <td>{p.linear_regression[p.linear_regression.length - 1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
