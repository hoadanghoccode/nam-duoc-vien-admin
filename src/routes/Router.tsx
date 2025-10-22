// src/routes/index.tsx
import { lazy, PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

/* Pages */
const FacilityList = lazy(() => import("../page/facility"));
const SpecialtyList = lazy(() => import("../page/speciality"));
const VietmapDemo = lazy(() => import("../page/VietmapDemo"));

// Content Management Pages
const AboutUsPage = lazy(() => import("../page/content/aboutus"));
const DongYIntroPage = lazy(() => import("../page/content/intro"));
const TermsOfServicePage = lazy(() => import("../page/content/termsofservice"));
const PrivacyPolicyPage = lazy(() => import("../page/content/privacypolicy"));
const ContactInfoPage = lazy(() => import("../page/content/contactinfo"));
const FAQPage = lazy(() => import("../page/content/faq"));
const UserGuidePage = lazy(() => import("../page/content/userguide"));

const Login = lazy(() => import("../page/authen/components/loginPage"));
const Doctor = lazy(() => import("../page/doctor"));
const Dashboard = lazy(() => import("../page/dashboard"));
const Appointment = lazy(() => import("../page/appointment"));
const RevenueReport = lazy(() => import("../page/revenue-report"));
const TopDoctors = lazy(() => import("../page/top-doctors"));

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
// function RequireAuth({ children }: PropsWithChildren) {
//   const location = useLocation();
//   if (!isAuthenticated()) {
//     return <Navigate to="/auth/login" replace state={{ from: location }} />;
//   }
//   return <>{children}</>;
// }

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
      // <RequireAuth>
      <MainLayout />
      // </RequireAuth>
    ),
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/facilities", element: <FacilityList /> },
      { path: "/specialties", element: <SpecialtyList /> },
      { path: "/vietmap-demo", element: <VietmapDemo /> },
      { path: "/doctor", element: <Doctor /> },
      { path: "/appointments", element: <Appointment /> },
      { path: "/revenue-report", element: <RevenueReport /> },
      { path: "/top-doctors", element: <TopDoctors /> },

      // Content Management Routes
      { path: "/content/about-us", element: <AboutUsPage /> },
      { path: "/content/dong-y-intro", element: <DongYIntroPage /> },
      { path: "/content/terms-of-service", element: <TermsOfServicePage /> },
      { path: "/content/privacy-policy", element: <PrivacyPolicyPage /> },
      { path: "/content/contact-info", element: <ContactInfoPage /> },
      { path: "/content/faq", element: <FAQPage /> },
      { path: "/content/user-guide", element: <UserGuidePage /> },

      // { path: "/venue/list", element: <VenueList /> },
      // { path: "/user/list", element: <UserList /> },
      // { path: "/user/roles", element: <RolePermissionManager /> },
      { path: "*", element: <Navigate to="/dashboard" /> },
      // fallback DUY NHẤT: khi đã đăng nhập mà URL lạ -> về dashboard
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
];

export default Router;
