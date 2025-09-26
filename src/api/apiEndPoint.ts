import authorizedAxiosInstance from "../services/Axios";

export const authen = {
  login: (credentials: { email: string; password: string }) => {
    return authorizedAxiosInstance.post("/Authentication/Login", credentials);
  },
  role: () => {
    return authorizedAxiosInstance.get("/Role/GetRoles");
  },

  // Đăng ký tài khoản
  register: (data: {
    displayName: string;
    password: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
  }) => {
    return authorizedAxiosInstance.post("/auth/register", data);
  },

  refreshToken: (refreshToken: string) => {
    return authorizedAxiosInstance.post("/auth/refresh-token", {
      refreshToken,
    });
  },
};
