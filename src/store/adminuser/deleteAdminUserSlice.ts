import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  adminUsersApi,
  DeleteAdminUserResponse,
} from "../../api/adminUsersApi";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface DeleteAdminUserState {
  statusById: Record<string, Status>;
  errorById: Record<string, string | null>;
  resultById: Record<string, DeleteAdminUserResponse | undefined>;
  deletedAt: Record<string, string | undefined>; // ISO time khi xoá thành công
}

const initialState: DeleteAdminUserState = {
  statusById: {},
  errorById: {},
  resultById: {},
  deletedAt: {},
};

/* ===== Thunk ===== */
export const deleteAdminUserAsync = createAsyncThunk<
  { id: string; data: DeleteAdminUserResponse },
  string,
  { rejectValue: string }
>("admin/users/delete", async (userId, { rejectWithValue }) => {
  try {
    const res = await adminUsersApi.delete(userId);
    // Trường hợp 204 No Content, res.data có thể là "" | undefined
    const data: DeleteAdminUserResponse = res.data || { success: true };
    return { id: userId, data };
  } catch (err: any) {
    const msg =
      err?.response?.data?.errorMessage ||
      err?.message ||
      "Không thể xoá người dùng.";
    return rejectWithValue(msg);
  }
});

/* ===== Slice ===== */
const deleteAdminUserSlice = createSlice({
  name: "deleteAdminUser",
  initialState,
  reducers: {
    clearDeleteState(state, action) {
      const id = action.payload as string | undefined;
      if (id) {
        delete state.statusById[id];
        delete state.errorById[id];
        delete state.resultById[id];
        delete state.deletedAt[id];
      } else {
        state.statusById = {};
        state.errorById = {};
        state.resultById = {};
        state.deletedAt = {};
      }
    },
  },
  extraReducers: (b) => {
    b.addCase(deleteAdminUserAsync.pending, (s, a) => {
      const id = a.meta.arg;
      s.statusById[id] = "loading";
      s.errorById[id] = null;
    })
      .addCase(deleteAdminUserAsync.fulfilled, (s, a) => {
        const { id, data } = a.payload;
        s.statusById[id] = "succeeded";
        s.resultById[id] = data;
        s.deletedAt[id] = new Date().toISOString();
      })
      .addCase(deleteAdminUserAsync.rejected, (s, a) => {
        const id = a.meta.arg;
        s.statusById[id] = "failed";
        s.errorById[id] = a.payload || "Đã xảy ra lỗi khi xoá";
      });
  },
});

export const { clearDeleteState } = deleteAdminUserSlice.actions;
export default deleteAdminUserSlice.reducer;
