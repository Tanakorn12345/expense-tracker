import axios from "axios";

const api = axios.create({
  baseURL: "https://expense-tracker-backend-2vaw.onrender.com/api",
});

export default api;
