import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

function unwrap(promise) {
  return promise.then((res) => res.data).catch((err) => {
    const detail =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Request failed";
    throw new Error(detail);
  });
}

export function getTechnicalIndicators(ticker) {
  return unwrap(client.get(`/technical_indicators/${ticker}`));
}

export function getMarketPrices(ticker) {
  return unwrap(client.get(`/market_prices/${ticker}`));
}

export function getFundamentals(ticker) {
  return unwrap(client.get(`/fundamentals/${ticker}`));
}

export function getNews(ticker) {
  return unwrap(client.get(`/news/${ticker}`));
}

export function getAiScore(ticker) {
  return unwrap(client.get(`/ai/score/${ticker}`));
}

export function registerUser(name, email, password) {
  return unwrap(client.post("/users/register", { name, email, password }));
}

export function addToWatchlist(userId, ticker) {
  return unwrap(client.post("/watchlist/add", { user_id: userId, ticker }));
}

export function getWatchlist(userId) {
  return unwrap(client.get(`/watchlist/${userId}`));
}

export function addComment(userId, ticker, comment) {
  return unwrap(
    client.post("/comments/add", { user_id: userId, ticker, comment })
  );
}

export function getComments(ticker) {
  return unwrap(client.get(`/comments/${ticker}`));
}
