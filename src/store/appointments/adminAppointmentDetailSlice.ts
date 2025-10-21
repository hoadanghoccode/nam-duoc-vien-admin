import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  AdminAppointmentDetail,
  adminAppointmentsApi,
} from "../../api/apiAppointments";

type State = {
  loading: boolean;
  error: string | null;
  data: AdminAppointmentDetail | null;
  id?: string;
};

const initialState: State = {
  loading: false,
  error: null,
  data: null,
};

export const getAdminAppointmentDetailAsync = createAsyncThunk(
  "adminAppointmentDetail/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await adminAppointmentsApi.getAppointmentDetail(id);
      return { data: res.data, id };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Lấy chi tiết lịch hẹn thất bại!"
      );
    }
  }
);

const adminAppointmentDetailSlice = createSlice({
  name: "adminAppointmentDetail",
  initialState,
  reducers: {
    resetAdminAppointmentDetail: (state) => {
      state.loading = false;
      state.error = null;
      state.data = null;
      state.id = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminAppointmentDetailAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminAppointmentDetailAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.id = action.payload.id;
      })
      .addCase(getAdminAppointmentDetailAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Unknown error";
      });
  },
});

export const { resetAdminAppointmentDetail } =
  adminAppointmentDetailSlice.actions;

export default adminAppointmentDetailSlice.reducer;
