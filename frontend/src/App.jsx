import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Dashboard />
      </main>
      <footer className="py-6 text-center text-xs text-slate-500">
        Predictions are estimates for educational purposes and are not guaranteed financial advice.
      </footer>
    </div>
  );
}
