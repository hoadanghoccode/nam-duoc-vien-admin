import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../Store";
import {
  adminUsersApi,
  AdminUsersQuery,
  AdminUserItem,
  PagingResponse,
} from "../../api/adminUsersApi";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface AdminUsersState {
  status: Status;
  error: string | null;
  data: PagingResponse<AdminUserItem> | null;
  query: AdminUsersQuery;
}

const initialState: AdminUsersState = {
  status: "idle",
  error: null,
  data: null,
  query: {
    PageIndex: 1,
    PageSize: 10,
    OrderColumn: "displayName",
    OrderDirection: "asc",
    // các filter khác để trống
  },
};

/* ========= Helpers ========= */
function normalizeResponse(
  payload: PagingResponse<AdminUserItem> | AdminUserItem[],
  q: AdminUsersQuery
): PagingResponse<AdminUserItem> {
  if (Array.isArray(payload)) {
    // server trả mảng thuần -> bọc lại
    return {
      pageIndex: q.PageIndex ?? 1,
      pageSize: q.PageSize ?? payload.length,
      totalCount: payload.length,
      orderColumn: q.OrderColumn,
      orderDirection: q.OrderDirection,
      items: payload,
    };
  }
  return payload;
}

/* ========= Thunk ========= */
export const getAdminUsersAsync = createAsyncThunk<
  PagingResponse<AdminUserItem>,
  AdminUsersQuery | void,
  { rejectValue: string; state: RootState }
>("admin/users/get", async (maybeQuery, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState & { adminUsers?: AdminUsersState };
    const current = state.adminUsers?.query;

    const q = { ...(current || {}), ...(maybeQuery || {}) };
    const res = await adminUsersApi.getList(q);
    return normalizeResponse(res.data as any, q);
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Không tải được danh sách người dùng";
    return rejectWithValue(msg);
  }
});

/* ========= Slice ========= */
const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    setAdminUsersQuery(state, action: PayloadAction<Partial<AdminUsersQuery>>) {
      state.query = { ...state.query, ...action.payload };
    },
    resetAdminUsers(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminUsersAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAdminUsersAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Map roles array to role string for display
        const mappedData = {
          ...action.payload,
          items: action.payload.items.map((user: any) => ({
            ...user,
            role: user.roles && user.roles.length > 0 
              ? user.roles[0].name 
              : "User",
          })),
        };
        state.data = mappedData;
      })
      .addCase(getAdminUsersAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export const { setAdminUsersQuery, resetAdminUsers } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
