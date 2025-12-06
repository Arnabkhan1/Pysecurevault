import axios from "axios";

// Backend URL (FastAPI running on port 8000)
const API = axios.create({
  baseURL: "http://localhost:8000",
});

// Automatically add the Token to every request if we have one
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;