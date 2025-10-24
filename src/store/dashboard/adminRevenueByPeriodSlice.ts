import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  adminRevenueByDoctorApi,
  AdminRevenueByPeriodItem,
  AdminRevenueByPeriodQuery,
} from "../../api/dasboardApi";

interface AdminRevenueByPeriodState {
  data: AdminRevenueByPeriodItem[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminRevenueByPeriodState = {
  data: [],
  loading: false,
  error: null,
};

// Helper function to get default date range
const getDefaultDateRange = () => {
  const today = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(today.getMonth() + 1);

  return {
    FromDate: today.toISOString().split("T")[0], // YYYY-MM-DD format
    ToDate: oneMonthLater.toISOString().split("T")[0],
  };
};

// ✅ Thunk
export const fetchRevenueByPeriod = createAsyncThunk<
  AdminRevenueByPeriodItem[],
  Partial<AdminRevenueByPeriodQuery>
>("adminRevenueByPeriod/fetch", async (params = {}, { rejectWithValue }) => {
  try {
    // Merge with default date range
    const defaultRange = getDefaultDateRange();
    const queryParams = {
      ...defaultRange,
      PeriodType: "daily" as const,
      ...params,
    };

    const response = await adminRevenueByDoctorApi.getRevenueByPeriod(
      queryParams
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.errorMessage || "Lỗi khi tải doanh thu theo kỳ"
    );
  }
});

const adminRevenueByPeriodSlice = createSlice({
  name: "adminRevenueByPeriod",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenueByPeriod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueByPeriod.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRevenueByPeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminRevenueByPeriodSlice.reducer;
