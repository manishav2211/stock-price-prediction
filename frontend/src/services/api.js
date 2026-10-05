import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 900000, // training can take a few minutes
});

export const errMsg = (e) => {
  const d = e.response?.data?.detail;
  if (typeof d === "string") return d;
  if (d) return "Invalid request.";
  if (e.code === "ERR_NETWORK") return "Cannot reach the backend. Is it running on the API URL?";
  return e.message || "Something went wrong.";
};

export const getStock = (t) => api.get(`/api/stock/${t}`).then((r) => r.data);
export const getHistory = (t, period = "1y") => api.get(`/api/history/${t}`, { params: { period } }).then((r) => r.data);
export const getIndicators = (t) => api.get(`/api/indicators/${t}`).then((r) => r.data);
export const trainModels = (ticker, epochs = 20) => api.post("/api/train", { ticker, epochs }).then((r) => r.data);
export const predict = (ticker, days) => api.post("/api/predict", { ticker, days }).then((r) => r.data);
export const getPerformance = (t) => api.get(`/api/model-performance/${t}`).then((r) => r.data);
export const getPredictions = (t) => api.get(`/api/predictions/${t}`).then((r) => r.data);
