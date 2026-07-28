import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

let getTokenFn = null;

export function setAuthTokenGetter(fn) {
  getTokenFn = fn;
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (getTokenFn) {
    const token = await getTokenFn();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (path, body) =>
    request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: (path, body) =>
    request(path, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    }),
};

export function AuthTokenBridge() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      setAuthTokenGetter(() => getToken());
    } else {
      setAuthTokenGetter(null);
    }
  }, [getToken, isSignedIn]);

  return null;
}

export const ensureUser = () => api.post("/api/users/ensure");
export const getUserAccounts = () => api.get("/api/accounts");
export const createAccount = (data) => api.post("/api/accounts", data);
export const updateDefaultAccount = (id) =>
  api.patch(`/api/accounts/${id}/default`);
export const getAccountWithTransactions = (id) =>
  api.get(`/api/accounts/${id}`);
export const getDashboardData = () => api.get("/api/dashboard");
export const getAnalytics = (accountId) =>
  api.get(accountId ? `/api/analytics?accountId=${accountId}` : "/api/analytics");
export const getAiInsights = () => api.post("/api/insights");
export const getCurrentBudget = (accountId) =>
  api.get(`/api/budget?accountId=${accountId}`);
export const updateBudget = (amount) => api.put("/api/budget", { amount });
export const createTransaction = (data) =>
  api.post("/api/transactions", data);
export const updateTransaction = (id, data) =>
  api.put(`/api/transactions/${id}`, data);
export const getTransaction = (id) => api.get(`/api/transactions/${id}`);
export const bulkDeleteTransactions = (ids) =>
  api.delete("/api/transactions", { ids });
export const scanReceipt = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/api/transactions/scan-receipt", formData);
};
