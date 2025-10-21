import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  adminAppointmentsApi,
  AdminCancelAppointmentRequest,
} from "../../api/apiAppointments";

type State = {
  loading: boolean;
  success: boolean;
  error: string | null;
  lastCanceledId?: string;
};

const initialState: State = {
  loading: false,
  success: false,
  error: null,
};

export const cancelAppointmentAdminAsync = createAsyncThunk(
  "adminAppointment/cancel",
  async (args: { id: string; cancelReason?: string }, { rejectWithValue }) => {
    try {
      const body: AdminCancelAppointmentRequest = {
        appointmentId: args.id,
        cancelReason: args.cancelReason,
      };
      await adminAppointmentsApi.cancelAppointment(args.id, body);
      // 200/204 No Content
      return { id: args.id };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Huỷ lịch hẹn thất bại!"
      );
    }
  }
);

const slice = createSlice({
  name: "adminCancelAppointment",
  initialState,
  reducers: {
    resetAdminCancelAppointment: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.lastCanceledId = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cancelAppointmentAdminAsync.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(cancelAppointmentAdminAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastCanceledId = action.payload.id;
      })
      .addCase(cancelAppointmentAdminAsync.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = (action.payload as string) || "Unknown error";
      });
  },
});

export const { resetAdminCancelAppointment } = slice.actions;
export default slice.reducer;
