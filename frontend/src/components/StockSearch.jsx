import { useState } from "react";

const EXAMPLES = ["AAPL", "TSLA", "MSFT", "RELIANCE.NS", "TCS.NS", "INFY.NS"];

export default function StockSearch({ onSearch, loading }) {
  const [value, setValue] = useState("");

  const submit = (t) => {
    const ticker = (t ?? value).trim().toUpperCase();
    if (ticker) onSearch(ticker);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Enter a stock symbol, e.g. AAPL or TCS.NS"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => submit()}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-6 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((t) => (
          <button
            key={t}
            onClick={() => { setValue(t); submit(t); }}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-indigo-500"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
