import { configureStore, createAction } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import {
  useDispatch as useAppDispatch,
  useSelector as useAppSelector,
  TypedUseSelectorHook,
} from "react-redux";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
// Reducers các module
import authReducer from "./authen/authSlice";
import specialtyCreateReducer from "./specialty/specialtyCreateSlice";
import specialtyDeleteReducer from "./specialty/specialtyDeleteSlice";
import specialtyReducer from "./specialty/specialtySlice";
import specialtyUpdateReducer from "./specialty/specialtyUpdateSlice";
import specialtyDetailReducer from "./specialty/specialtyDetailSlice";

// Facility reducers
import adminMedicalFacilityReducer from "./facilities/adminMedicalFacilitySlice";
import medicalFacilityCreateReducer from "./facilities/medicalFacilityCreateSlice";
import adminMedicalFacilityUpdateReducer from "./facilities/adminMedicalFacilityUpdateSlice";
import adminMedicalFacilityDeleteReducer from "./facilities/adminMedicalFacilityDeleteSlice";
import adminMedicalFacilityDetailReducer from "./facilities/adminMedicalFacilityDetailSlice";
import adminSpecialtiesByFacilityReducer from "./facilities/adminSpecialtiesByFacilitySlice";

// Doctor reducers
import adminDoctorsReducer from "./doctor/adminDoctorsSlice";
import adminDoctorCreateReducer from "./doctor/adminDoctorCreateSlice";
import adminDoctorUpdateReducer from "./doctor/adminDoctorUpdateSlice";
import adminDoctorDeleteReducer from "./doctor/adminDoctorDeleteSlice";
import adminDoctorDetailReducer from "./doctor/adminDoctorDetailSlice";
import adminTimeSlotReducer from "./doctor/adminTimeSlotSlice";

// Dashboard reducers
import adminRevenueOverviewReducer from "./dashboard/adminRevenueOverviewSlice";
import adminRevenueByPeriodReducer from "./dashboard/adminRevenueByPeriodSlice";
import adminTopDoctorsReducer from "./dashboard/adminTopDoctorsSlice";
import adminRevenueStatisticsReducer from "./dashboard/adminRevenueStatisticsSlice";
import revenueByDoctorReducer from "./dashboard/revenueByDoctorSlice";

// Appointment reducers
import adminAppointmentsReducer from "./appointments/adminAppointmentsSlice";
import adminAppointmentDetailReducer from "./appointments/adminAppointmentDetailSlice";
import adminConfirmAppointmentReducer from "./appointments/adminConfirmAppointmentSlice";
import adminCompleteAppointmentReducer from "./appointments/adminCompleteAppointmentSlice";
import adminCancelAppointmentReducer from "./appointments/adminCancelAppointmentSlice";

// Admin User reducers
import adminUsersReducer from "./adminuser/adminUsersSlice";
import adminUserDetailReducer from "./adminuser/adminUserDetailSlice";
import createAdminUserReducer from "./adminuser/createAdminUserSlice";
import updateAdminUserReducer from "./adminuser/updateAdminUserSlice";
import deleteAdminUserReducer from "./adminuser/deleteAdminUserSlice";
import resetUserPasswordReducer from "./adminuser/resetUserPasswordSlice";

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  specialtyCreate: specialtyCreateReducer,
  specialtyDelete: specialtyDeleteReducer,
  specialty: specialtyReducer,
  specialtyUpdate: specialtyUpdateReducer,
  specialtyDetail: specialtyDetailReducer,
  
  // Facility reducers
  adminMedicalFacility: adminMedicalFacilityReducer,
  medicalFacilityCreate: medicalFacilityCreateReducer,
  adminMedicalFacilityUpdate: adminMedicalFacilityUpdateReducer,
  adminMedicalFacilityDelete: adminMedicalFacilityDeleteReducer,
  adminMedicalFacilityDetail: adminMedicalFacilityDetailReducer,
  adminSpecialtiesByFacility: adminSpecialtiesByFacilityReducer,
  
  // Doctor reducers
  adminDoctors: adminDoctorsReducer,
  adminDoctorCreate: adminDoctorCreateReducer,
  adminDoctorUpdate: adminDoctorUpdateReducer,
  adminDoctorDelete: adminDoctorDeleteReducer,
  adminDoctorDetail: adminDoctorDetailReducer,
  adminTimeSlot: adminTimeSlotReducer,
  
  // Dashboard reducers
  adminRevenueOverview: adminRevenueOverviewReducer,
  adminRevenueByPeriod: adminRevenueByPeriodReducer,
  adminTopDoctors: adminTopDoctorsReducer,
  adminRevenueStatistics: adminRevenueStatisticsReducer,
  revenueByDoctor: revenueByDoctorReducer,
  
  // Appointment reducers
  adminAppointments: adminAppointmentsReducer,
  adminAppointmentDetail: adminAppointmentDetailReducer,
  adminConfirmAppointment: adminConfirmAppointmentReducer,
  adminCompleteAppointment: adminCompleteAppointmentReducer,
  adminCancelAppointment: adminCancelAppointmentReducer,
  
  // Admin User reducers
  adminUsers: adminUsersReducer,
  adminUserDetail: adminUserDetailReducer,
  createAdminUser: createAdminUserReducer,
  updateAdminUser: updateAdminUserReducer,
  deleteAdminUser: deleteAdminUserReducer,
  resetUserPassword: resetUserPasswordReducer,
});

// Chỉ định reducer nào được lưu persist (bạn đổi lại theo mục đích, ví dụ: ['auth', 'customizer'] nếu muốn lưu cả customizer)
const whitelistReducers = ["auth", "userInfor"]; // hoặc ['auth', 'customizer']

const persistConfig = {
  key: "root",
  storage,
  whitelist: whitelistReducers,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Action reset toàn bộ store
export const resetStore = createAction("resetStore");

// Middleware cho action reset
const resetMiddleware = (storeAPI: any) => (next: any) => (action: any) => {
  if (action.type === resetStore.type) {
    storeAPI.dispatch({ type: "RESET_ALL" });
  }
  return next(action);
};

// Tạo store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(resetMiddleware),
});

export const persistor = persistStore(store);

// Export type cho typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof rootReducer>;

// Hook cho react-redux
export const { dispatch } = store;
export const useDispatch = () => useAppDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useAppSelector;

export default store;
