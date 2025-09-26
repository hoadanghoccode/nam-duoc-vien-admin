// src/routes/index.tsx
import { lazy, PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

/* Pages */
const Dashboard = lazy(() => import("../page/Dashboard"));
const BookingList = lazy(() => import("../page/BookingList"));
const VenueList = lazy(() => import("../page/VenueList"));
const UserList = lazy(() => import("../page/UserList"));
const Login = lazy(() => import("../page/authen/components/loginPage"));

/* ===== Token helpers ===== */
const getToken = () => localStorage.getItem("accessToken") || "";

const isJwtValid = (token: string) => {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true; // token không phải JWT -> coi như hợp lệ nếu có
    const payload = JSON.parse(atob(parts[1]));
    if (!payload?.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return !!token;
  }
};

const isAuthenticated = () => isJwtValid(getToken());

/* ===== Guards (wrappers) ===== */
function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

function OnlyGuests({ children }: PropsWithChildren) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

/* ===== Router config ===== */
const Router = [
  // Trang login: chỉ cho guest
  {
    path: "/auth/login",
    element: (
      <OnlyGuests>
        <Login />
      </OnlyGuests>
    ),
  },

  // Nhóm cần đăng nhập
  {
    path: "/",
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/booking/list", element: <BookingList /> },
      { path: "/venue/list", element: <VenueList /> },
      { path: "/user/list", element: <UserList /> },
      // fallback DUY NHẤT: khi đã đăng nhập mà URL lạ -> về dashboard
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
];

export default Router;
