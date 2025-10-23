// src/utils/authorizedAxios.ts
import axios from "axios";
import { setAccessToken } from "../store/authen/authSlice";
import store from "../store/Store";

// ==== Config chung ====
const BASE_URL = import.meta.env.VITE_BASE_URL as string;
console.log("VITE_BASE_URL", import.meta.env.VITE_BASE_URL);

// Những endpoint KHÔNG nên gắn bearer / không tự refresh (auth flow)
const AUTH_BYPASS_PATHS = [
  "/Authentication/Login",
  "/Authentication/LoginAdmin", // <- Admin login endpoint
  "/Authentication/register",
  "/Authentication/RequestForgotPassword",
  "/Authentication/ConfirmForgotPassword",
  "/Authentication/RefreshToken", // <- quan trọng
];

// Instance chính dùng cho mọi API (có interceptors)
const authorizedAxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "*/*",
  },
  withCredentials: true,
  timeout: 60 * 10 * 1000, // 10 phút
});

// Instance “trần” để gọi refresh token, tránh bị interceptors chồng lặp
const plainAxios = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30 * 1000,
});

// ==== Request Interceptor ====
authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken =
      state.auth?.accessToken || localStorage.getItem("accessToken");

    const url = config.url || "";
    const shouldBypass = AUTH_BYPASS_PATHS.some((p) => url.includes(p));

    if (accessToken && !shouldBypass) {
      if (!config.headers)
        config.headers = {} as import("axios").AxiosRequestHeaders;
      (config.headers as any).Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==== Refresh Token Queue (chống đua) ====
let refreshTokenPromise: Promise<string> | null = null;

/**
 * Gọi refresh token đúng như Swagger:
 * POST /Authentication/RefreshToken?Token=...&RefreshToken=...
 * - Không gửi body
 * - Không gửi Authorization header
 * - Đọc token mới từ data.content.token
 */
const doRefreshToken = async (): Promise<string> => {
  if (refreshTokenPromise) return refreshTokenPromise;

  const refreshToken = localStorage.getItem("refreshToken");
  const currentAccess =
    store.getState().auth?.accessToken || localStorage.getItem("accessToken");

  if (!refreshToken) throw new Error("NO_REFRESH_TOKEN");

  refreshTokenPromise = plainAxios
    .post(
      "/Authentication/RefreshToken",
      null, // <- KHÔNG gửi body
      {
        // <- Gửi qua query string (đúng như Swagger)
        params: {
          Token: currentAccess, // tên param phải đúng hoa/thường
          RefreshToken: refreshToken,
        },
        // <- Đảm bảo không có Bearer kèm theo
        headers: { Authorization: "" },
      }
    )
    .then((res) => {
      /**
       * Backend trả về:
       * {
       *   content: { token: "...", refreshToken: "..." },
       *   statusCode: 200, ...
       * }
       */
      const content = res?.data?.content ?? {};
      const newAccessToken: string | undefined = content.token;
      const newRefreshToken: string | undefined = content.refreshToken;

      if (!newAccessToken) throw new Error("INVALID_REFRESH_RESPONSE");

      // Lưu lại token mới
      store.dispatch(setAccessToken(newAccessToken));
      localStorage.setItem("accessToken", newAccessToken);
      if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

      // Cập nhật header mặc định cho instance
      authorizedAxiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      return newAccessToken;
    })
    .finally(() => {
      refreshTokenPromise = null;
    });

  return refreshTokenPromise;
};

// ==== Response Interceptor ====
const isAuthBypass = (url = "") =>
  AUTH_BYPASS_PATHS.some((p) => url.includes(p));

authorizedAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config || {};
    const status = error?.response?.status as number | undefined;
    const url = (originalRequest?.url as string) || "";
    const data = error?.response?.data as any;

    // Xác định 401 do access token hết hạn
    const isAccessExpired401 =
      status === 401 &&
      (data?.errorType === "ACCESS_TOKEN_EXPIRED" ||
        String(data?.errorMessage || "").toLowerCase().includes("expired"));

    const bypass = isAuthBypass(url);
    const isRefreshEndpoint = url.includes("/Authentication/RefreshToken");

    // 401 do hết hạn token -> refresh (không ở auth path, không phải refresh endpoint, chưa retry)
    if (
      isAccessExpired401 &&
      !bypass &&
      !isRefreshEndpoint &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newAccess = await doRefreshToken();
        originalRequest.headers = originalRequest.headers || {};
        (originalRequest.headers as any).Authorization = `Bearer ${newAccess}`;
        return authorizedAxiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại -> Clear tokens và redirect về login
        console.error("Refresh token failed:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        store.dispatch(setAccessToken(null));
        
        // Redirect về trang login
        window.location.href = "/auth/login";
        
        return Promise.reject(refreshError);
      }
    }

    // 401 nhưng không phải hết hạn -> trả lỗi
    if (status === 401) return Promise.reject(error);
    if (status === 403) return Promise.reject(error);
    if ((status ?? 0) >= 500) return Promise.reject(error);

    return Promise.reject(error);
  }
);

export default authorizedAxiosInstance;
