import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AdminUserDetail, adminUsersApi } from "../../api/adminUsersApi";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface AdminUserDetailState {
  byId: Record<string, AdminUserDetail | undefined>;
  statusById: Record<string, Status>;
  errorById: Record<string, string | null>;
  currentId?: string;
}

const initialState: AdminUserDetailState = {
  byId: {},
  statusById: {},
  errorById: {},
  currentId: undefined,
};

export const getAdminUserByIdAsync = createAsyncThunk<
  { id: string; data: AdminUserDetail },
  string,
  { rejectValue: string }
>("admin/users/getById", async (userId, { rejectWithValue }) => {
  try {
    const res = await adminUsersApi.getById(userId);
    return { id: userId, data: res.data };
  } catch (err: any) {
    const msg =
      err?.response?.data?.errorMessage ||
      err?.message ||
      "Không tải được thông tin người dùng";
    return rejectWithValue(msg);
  }
});

const adminUserDetailSlice = createSlice({
  name: "adminUserDetail",
  initialState,
  reducers: {
    setCurrentAdminUserId(state, action) {
      state.currentId = action.payload as string | undefined;
    },
    clearAdminUserDetail(state, action) {
      const id = action.payload as string | undefined;
      if (id) {
        delete state.byId[id];
        delete state.statusById[id];
        delete state.errorById[id];
        if (state.currentId === id) state.currentId = undefined;
      } else {
        state.byId = {};
        state.statusById = {};
        state.errorById = {};
        state.currentId = undefined;
      }
    },
  },
  extraReducers: (b) => {
    b.addCase(getAdminUserByIdAsync.pending, (s, a) => {
      const id = a.meta.arg;
      s.statusById[id] = "loading";
      s.errorById[id] = null;
      s.currentId = id;
    })
      .addCase(getAdminUserByIdAsync.fulfilled, (s, a) => {
        const { id, data } = a.payload;
        // Map roles array to role string for display (ensure it's the exact union type)
        const mapRole = (
          roles?: { name: string }[]
        ): AdminUserDetail["role"] => {
          if (!roles || roles.length === 0) return "User";
          return roles[0].name === "Admin" ? "Admin" : "User";
        };
        const mappedData = {
          ...data,
          role: mapRole(data.roles),
        } as AdminUserDetail;
        s.byId[id] = mappedData;
        s.statusById[id] = "succeeded";
        s.errorById[id] = null;
      })
      .addCase(getAdminUserByIdAsync.rejected, (s, a) => {
        const id = a.meta.arg;
        s.statusById[id] = "failed";
        s.errorById[id] = a.payload || "Đã xảy ra lỗi";
      });
  },
});

export const { setCurrentAdminUserId, clearAdminUserDetail } =
  adminUserDetailSlice.actions;
export default adminUserDetailSlice.reducer;
