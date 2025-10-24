import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  adminAppointmentsApi,
  ConfirmAppointmentRequest,
} from "../../api/apiAppointments";

type State = {
  loading: boolean;
  success: boolean;
  error: string | null;
  lastConfirmedId?: string;
};

const initialState: State = {
  loading: false,
  success: false,
  error: null,
};

export const confirmAppointmentAdminAsync = createAsyncThunk(
  "adminAppointment/confirm",
  async (args: { id: string; notes?: string }, { rejectWithValue }) => {
    try {
      const body: ConfirmAppointmentRequest = {
        appointmentId: args.id,
        notes: args.notes,
      };
      const res = await adminAppointmentsApi.confirmAppointment(args.id, body);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage || "Xác nhận lịch hẹn thất bại!"
      );
    }
  }
);

const adminConfirmAppointmentSlice = createSlice({
  name: "adminConfirmAppointment",
  initialState,
  reducers: {
    resetConfirmAppointmentState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.lastConfirmedId = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(confirmAppointmentAdminAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(confirmAppointmentAdminAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastConfirmedId = action.meta.arg.id;
      })
      .addCase(confirmAppointmentAdminAsync.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = (action.payload as string) || "Unknown error";
      });
  },
});

export const { resetConfirmAppointmentState } =
  adminConfirmAppointmentSlice.actions;

export default adminConfirmAppointmentSlice.reducer;
