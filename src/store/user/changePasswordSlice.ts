import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminUsersApi, ChangePasswordRequest } from "../../api/adminUsersApi";

interface ChangePasswordState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ChangePasswordState = {
  loading: false,
  error: null,
  success: false,
};

export const changePasswordAsync = createAsyncThunk(
  "changePassword/change",
  async (data: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      const response = await adminUsersApi.changePassword(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errorMessage || "Đổi mật khẩu thất bại!"
      );
    }
  }
);

const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState,
  reducers: {
    resetChangePasswordState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePasswordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(changePasswordAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(changePasswordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Đổi mật khẩu thất bại!";
        state.success = false;
      });
  },
});

export const { resetChangePasswordState } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;

