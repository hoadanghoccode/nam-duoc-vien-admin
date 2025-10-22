import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  AdminUserDetail,
  adminUsersApi,
  UpdateAdminUserRequest,
} from "../../api/adminUsersApi";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface UpdateAdminUserState {
  statusById: Record<string, Status>;
  errorById: Record<string, string | null>;
  resultById: Record<string, AdminUserDetail | undefined>;
}

const initialState: UpdateAdminUserState = {
  statusById: {},
  errorById: {},
  resultById: {},
};

/* ===== Thunk ===== */
export const updateAdminUserAsync = createAsyncThunk<
  { id: string; data: AdminUserDetail },
  { userId: string; payload: UpdateAdminUserRequest },
  { rejectValue: string }
>("admin/users/update", async ({ userId, payload }, { rejectWithValue }) => {
  try {
    const res = await adminUsersApi.update(userId, payload);
    return { id: userId, data: res.data };
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Không thể cập nhật người dùng.";
    return rejectWithValue(msg);
  }
});

/* ===== Slice ===== */
const updateAdminUserSlice = createSlice({
  name: "updateAdminUser",
  initialState,
  reducers: {
    clearUpdateUser(state, action) {
      const id = action.payload as string | undefined;
      if (id) {
        delete state.statusById[id];
        delete state.errorById[id];
        delete state.resultById[id];
      } else {
        state.statusById = {};
        state.errorById = {};
        state.resultById = {};
      }
    },
  },
  extraReducers: (b) => {
    b.addCase(updateAdminUserAsync.pending, (s, a) => {
      const id = a.meta.arg.userId;
      s.statusById[id] = "loading";
      s.errorById[id] = null;
    })
      .addCase(updateAdminUserAsync.fulfilled, (s, a) => {
        const { id, data } = a.payload;
        // Map roles array to role string for display
        const mappedData: any = {
          ...data,
          role: data.roles && data.roles.length > 0 
            ? (data.roles[0] as any).name 
            : "User",
        };
        s.statusById[id] = "succeeded";
        s.resultById[id] = mappedData;
      })
      .addCase(updateAdminUserAsync.rejected, (s, a) => {
        const id = a.meta.arg.userId;
        s.statusById[id] = "failed";
        s.errorById[id] = a.payload || "Đã xảy ra lỗi khi cập nhật";
      });
  },
});

export const { clearUpdateUser } = updateAdminUserSlice.actions;
export default updateAdminUserSlice.reducer;
