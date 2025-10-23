import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  AdminUserDetail,
  adminUsersApi,
  CreateAdminUserRequest,
} from "../../api/adminUsersApi";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface CreateAdminUserState {
  status: Status;
  error: string | null;
  result: AdminUserDetail | null;
}

const initialState: CreateAdminUserState = {
  status: "idle",
  error: null,
  result: null,
};

/* ===== Thunk ===== */
export const createAdminUserAsync = createAsyncThunk<
  AdminUserDetail,
  CreateAdminUserRequest,
  { rejectValue: string }
>("admin/users/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await adminUsersApi.create(payload);
    return res.data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.errorMessage ||
      err?.message ||
      "Không thể tạo người dùng mới.";
    return rejectWithValue(msg);
  }
});

/* ===== Slice ===== */
const createAdminUserSlice = createSlice({
  name: "createAdminUser",
  initialState,
  reducers: {
    resetCreateAdminUser(state) {
      state.status = "idle";
      state.error = null;
      state.result = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(createAdminUserAsync.pending, (s) => {
      s.status = "loading";
      s.error = null;
      s.result = null;
    })
      .addCase(createAdminUserAsync.fulfilled, (s, a) => {
        s.status = "succeeded";
        // Map roles array to role string for display
        const role: AdminUserDetail["role"] =
          a.payload.roles && a.payload.roles.length > 0 && a.payload.roles[0].name === "Admin"
            ? "Admin"
            : "User";
        const mappedData: AdminUserDetail = {
          ...a.payload,
          role,
        };
        s.result = mappedData;
      })
      .addCase(createAdminUserAsync.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload || "Đã xảy ra lỗi khi tạo người dùng";
      });
  },
});

export const { resetCreateAdminUser } = createAdminUserSlice.actions;
export default createAdminUserSlice.reducer;
