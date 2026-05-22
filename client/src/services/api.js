import { API_BASE_URL } from "../config";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../utils/token";

const request = async (path, options = {}) => {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Something went wrong");
  }

  return payload;
};

export const login = async ({ identifier, password }) => {
  const key = identifier.includes("@") ? "email" : "username";
  const payload = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ [key]: identifier, password }),
  });
  setTokens(payload.data || {});
  return payload.data;
};

export const register = async ({ username, email, password, gender }) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password, gender }),
  });

export const verifyOtp = async ({ email, otp }) => {
  const payload = await request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
  setTokens(payload.data || {});
  return payload.data;
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const payload = await request("/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  setTokens(payload.data || {});
  return payload.data;
};

export const logout = async () => {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    clearTokens();
  }
};

export const getStats = async () => request("/stats");
