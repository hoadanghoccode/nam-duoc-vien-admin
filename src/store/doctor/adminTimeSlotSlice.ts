import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AdminTimeSlot, adminTimeSlotApi } from "../../api/doctorApi";

interface State {
  loading: boolean;
  error: string | null;
  data: AdminTimeSlot[];
}

const initialState: State = {
  loading: false,
  error: null,
  data: [],
};

export const getAdminTimeSlotsAsync = createAsyncThunk(
  "adminTimeSlot/getAll",
  async (isActive: boolean, { rejectWithValue }) => {
    try {
      const res = await adminTimeSlotApi.getTimeSlots(isActive);
      return res.data as AdminTimeSlot[];
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage || "Lấy danh sách khung giờ thất bại!"
      );
    }
  }
);

const adminTimeSlotSlice = createSlice({
  name: "adminTimeSlot",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(getAdminTimeSlotsAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(getAdminTimeSlotsAsync.fulfilled, (s, a) => {
      s.loading = false;
      s.data = a.payload as AdminTimeSlot[];
    });
    b.addCase(getAdminTimeSlotsAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Unknown error";
    });
  },
});

export default adminTimeSlotSlice.reducer;
