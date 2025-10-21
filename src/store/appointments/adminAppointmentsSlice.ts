import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AdminAppointmentItem,
  adminAppointmentsApi,
  AdminAppointmentsQuery,
  PagingResponse,
} from "../../api/apiAppointments";

type State = {
  loading: boolean;
  error: string | null;
  data: PagingResponse<AdminAppointmentItem> | null;
  lastQuery?: AdminAppointmentsQuery;
};

const initialState: State = {
  loading: false,
  error: null,
  data: null,
  lastQuery: undefined,
};

export const getAdminAppointmentsAsync = createAsyncThunk(
  "adminAppointments/get",
  async (params: AdminAppointmentsQuery, { rejectWithValue }) => {
    try {
      const res = await adminAppointmentsApi.getAppointments(params);
      return { data: res.data, query: params };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Lấy danh sách lịch hẹn thất bại!"
      );
    }
  }
);

const adminAppointmentsSlice = createSlice({
  name: "adminAppointments",
  initialState,
  reducers: {
    resetAdminAppointments: (state) => {
      state.loading = false;
      state.error = null;
      state.data = null;
      state.lastQuery = undefined;
    },
    // tùy chọn: cập nhật pageIndex tại chỗ
    updateAdminAppointmentsPage: (state, action: PayloadAction<number>) => {
      if (state.data) state.data.pageIndex = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminAppointmentsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminAppointmentsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.lastQuery = action.payload.query;
      })
      .addCase(getAdminAppointmentsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Unknown error";
      });
  },
});

export const { resetAdminAppointments, updateAdminAppointmentsPage } =
  adminAppointmentsSlice.actions;

export default adminAppointmentsSlice.reducer;
