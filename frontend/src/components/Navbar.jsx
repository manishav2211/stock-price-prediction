export default function Navbar() {
  return (
    <nav className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📈</span>
          <span className="text-lg font-semibold">AI Stock Price Prediction</span>
        </div>
        <span className="hidden text-sm text-slate-400 sm:block">React • FastAPI • LSTM • MongoDB</span>
      </div>
    </nav>
  );
}
