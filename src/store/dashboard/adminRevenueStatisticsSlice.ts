// store/slices/adminRevenueStatisticsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  adminRevenueByDoctorApi,
  AdminRevenueStatisticsQuery,
  AdminRevenueStatisticsResponse,
} from "../../api/dasboardApi";

interface AdminRevenueStatisticsState {
  loading: boolean;
  data: AdminRevenueStatisticsResponse | null;
  error: string | null;
}

const initialState: AdminRevenueStatisticsState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk
export const fetchRevenueStatistics = createAsyncThunk(
  "adminRevenueStatistics/fetchRevenueStatistics",
  async (params: AdminRevenueStatisticsQuery, { rejectWithValue }) => {
    try {
      const response = await adminRevenueByDoctorApi.getRevenueStatistics(
        params
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch revenue statistics"
      );
    }
  }
);

// Slice
const adminRevenueStatisticsSlice = createSlice({
  name: "adminRevenueStatistics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenueStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRevenueStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminRevenueStatisticsSlice.reducer;
