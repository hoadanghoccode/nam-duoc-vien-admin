import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  adminAppointmentsApi,
  CompleteAppointmentRequest,
} from "../../api/apiAppointments";

type State = {
  loading: boolean;
  success: boolean;
  error: string | null;
  lastCompletedId?: string;
};

const initialState: State = {
  loading: false,
  success: false,
  error: null,
};

export const completeAppointmentAdminAsync = createAsyncThunk(
  "adminAppointment/complete",
  async (args: { id: string; notes?: string }, { rejectWithValue }) => {
    try {
      const body: CompleteAppointmentRequest = {
        appointmentId: args.id,
        notes: args.notes,
      };
      await adminAppointmentsApi.completeAppointment(args.id, body);
      // API hay trả 204 No Content
      return { id: args.id };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Hoàn tất lịch hẹn thất bại!"
      );
    }
  }
);

const adminCompleteAppointmentSlice = createSlice({
  name: "adminCompleteAppointment",
  initialState,
  reducers: {
    resetCompleteAppointmentState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.lastCompletedId = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(completeAppointmentAdminAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(completeAppointmentAdminAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastCompletedId = action.payload.id;
      })
      .addCase(completeAppointmentAdminAsync.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = (action.payload as string) || "Unknown error";
      });
  },
});

export const { resetCompleteAppointmentState } =
  adminCompleteAppointmentSlice.actions;

export default adminCompleteAppointmentSlice.reducer;
