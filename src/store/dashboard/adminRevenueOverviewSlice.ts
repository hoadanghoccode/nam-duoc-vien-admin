import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  adminRevenueByDoctorApi,
  RevenueOverviewQuery,
  RevenueOverviewResponse,
} from "../../api/dasboardApi";

type State = {
  loading: boolean;
  error: string | null;
  data: RevenueOverviewResponse | null;
  params?: RevenueOverviewQuery;
};

const initialState: State = {
  loading: false,
  error: null,
  data: null,
};

// Helper function to get default date range
const getDefaultDateRange = () => {
  const today = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(today.getMonth() + 1);
  
  return {
    fromDate: today.toISOString().split('T')[0], // YYYY-MM-DD format
    toDate: oneMonthLater.toISOString().split('T')[0],
  };
};

export const fetchAdminRevenueOverviewAsync = createAsyncThunk(
  "adminDashboard/fetchRevenueOverview",
  async (query: Partial<RevenueOverviewQuery> = {}, { rejectWithValue }) => {
    try {
      // Merge with default date range
      const defaultRange = getDefaultDateRange();
      const queryParams = {
        ...defaultRange,
        ...query, // Override nếu có params được truyền vào
      };
      
      const response = await adminRevenueByDoctorApi.getRevenueOverview(queryParams);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Không thể tải tổng quan doanh thu!"
      );
    }
  }
);

const adminRevenueOverviewSlice = createSlice({
  name: "adminRevenueOverview",
  initialState,
  reducers: {
    resetAdminRevenueOverview: (state) => {
      state.loading = false;
      state.error = null;
      state.data = null;
      state.params = undefined;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchAdminRevenueOverviewAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminRevenueOverviewAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAdminRevenueOverviewAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Unknown error";
      });
  },
});

export const { resetAdminRevenueOverview } = adminRevenueOverviewSlice.actions;
export default adminRevenueOverviewSlice.reducer;
