import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  adminUsersApi,
  ResetUserPasswordResponse,
} from "../../api/adminUsersApi";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface ResetPasswordState {
  statusById: Record<string, Status>;
  errorById: Record<string, string | null>;
  resultById: Record<string, ResetUserPasswordResponse | undefined>;
}

const initialState: ResetPasswordState = {
  statusById: {},
  errorById: {},
  resultById: {},
};

/* ===== Thunk ===== */
export const resetUserPasswordAsync = createAsyncThunk<
  { id: string; data: ResetUserPasswordResponse },
  string,
  { rejectValue: string }
>("admin/users/resetPassword", async (userId, { rejectWithValue }) => {
  try {
    const res = await adminUsersApi.resetPassword({ userId });
    return { id: userId, data: res.data };
  } catch (err: any) {
    const msg =
      err?.response?.data?.errorMessage ||
      err?.message ||
      "Không thể reset mật khẩu người dùng.";
    return rejectWithValue(msg);
  }
});

/* ===== Slice ===== */
const resetUserPasswordSlice = createSlice({
  name: "resetUserPassword",
  initialState,
  reducers: {
    clearResetPassword(state, action) {
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
    b.addCase(resetUserPasswordAsync.pending, (s, a) => {
      const id = a.meta.arg;
      s.statusById[id] = "loading";
      s.errorById[id] = null;
    })
      .addCase(resetUserPasswordAsync.fulfilled, (s, a) => {
        const { id, data } = a.payload;
        s.statusById[id] = "succeeded";
        s.resultById[id] = data;
      })
      .addCase(resetUserPasswordAsync.rejected, (s, a) => {
        const id = a.meta.arg;
        s.statusById[id] = "failed";
        s.errorById[id] = a.payload || "Đã xảy ra lỗi khi reset mật khẩu.";
      });
  },
});

export const { clearResetPassword } = resetUserPasswordSlice.actions;
export default resetUserPasswordSlice.reducer;
