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

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  // customizer: CustomizerReducer,
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
