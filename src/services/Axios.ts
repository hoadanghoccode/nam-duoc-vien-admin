// src/utils/authorizedAxios.ts
import axios from "axios";
import { setAccessToken } from "../store/authen/authSlice";
import store from "../store/Store";

// ==== Config chung ====
const BASE_URL = import.meta.env.VITE_BASE_URL as string;
console.log("VITE_BASE_URL", import.meta.env.VITE_BASE_URL);

// Những endpoint KHÔNG nên chạm refresh/redirect (auth flow)
const AUTH_BYPASS_PATHS = [
  "/Authentication/Login",
  "/Authentication/register",
  "/Authentication/RequestForgotPassword",
  "/Authentication/ConfirmForgotPassword",
  "/Authentication/RefreshToken",
];

// Instance chính dùng cho mọi API (có interceptors)
const authorizedAxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "*/*",
  },
  withCredentials: true,
  // 10 minutes (bạn set 10000 * 60 * 10 = 100 phút ở file trước; mình giữ 10 phút)
  timeout: 60 * 10 * 1000,
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

    // Nếu là các path auth bypass thì không gắn bearer
    const url = config.url || "";
    const shouldBypass = AUTH_BYPASS_PATHS.some((p) => url.includes(p));

    if (accessToken && !shouldBypass) {
      // đảm bảo headers tồn tại
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

const doRefreshToken = async (): Promise<string> => {
  // Nếu đã có promise refresh đang chạy -> dùng lại
  if (refreshTokenPromise) return refreshTokenPromise;

  const refreshToken = localStorage.getItem("refreshToken");
  const currentAccess =
    store.getState().auth?.accessToken || localStorage.getItem("accessToken");

  if (!refreshToken) {
    // Không có refreshToken => không thể refresh
    throw new Error("NO_REFRESH_TOKEN");
  }

  refreshTokenPromise = plainAxios
    .post("/Authentication/RefreshToken", {
      refreshToken,
      token: currentAccess,
    })
    .then((res) => {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        res.data || {};

      if (!newAccessToken) throw new Error("INVALID_REFRESH_RESPONSE");

      // Lưu lại token mới
      store.dispatch(setAccessToken(newAccessToken));
      localStorage.setItem("accessToken", newAccessToken);
      if (newRefreshToken)
        localStorage.setItem("refreshToken", newRefreshToken);

      // cập nhật header mặc định cho instance
      authorizedAxiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      return newAccessToken as string;
    })
    .finally(() => {
      // reset để lần sau có thể refresh tiếp
      refreshTokenPromise = null;
    });

  return refreshTokenPromise;
};

// response interceptor
const isAuthBypass = (url = "") =>
  AUTH_BYPASS_PATHS.some((p) => url.includes(p));

authorizedAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config || {};
    const status = error?.response?.status as number | undefined;
    const url = (originalRequest?.url as string) || "";
    const data = error?.response?.data as any;

    // Chỉ coi là "token hết hạn" khi 401 + errorType phù hợp
    const isAccessExpired401 =
      status === 401 &&
      (data?.errorType === "ACCESS_TOKEN_EXPIRED" ||
        // fallback phòng khi BE đổi message
        String(data?.errorMessage || "")
          .toLowerCase()
          .includes("expired"));

    const bypass = isAuthBypass(url);
    const isRefreshEndpoint = url.includes("/Authentication/RefreshToken");

    // ===== 401 do access token hết hạn => thử refresh (không ở auth path, không phải refresh endpoint, chưa retry) =====
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
      } catch (e) {
        // Refresh fail -> tùy dự án: logout/redirect
        // await handleLogout();
        return Promise.reject(e);
      }
    }

    // ===== 401 nhưng KHÔNG phải do hết hạn (ví dụ: sai cred ở login, hoặc refresh token hỏng) =====
    // -> không refresh, trả lỗi
    if (status === 401) {
      return Promise.reject(error);
    }

    // ===== 403: không đủ quyền =====
    if (status === 403) return Promise.reject(error);

    // ===== 500+ =====
    if ((status ?? 0) >= 500) return Promise.reject(error);

    // Các lỗi khác giữ nguyên
    return Promise.reject(error);
  }
);

export default authorizedAxiosInstance;
