// store/slices/adminTopDoctorsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  adminRevenueByDoctorApi,
  AdminTopDoctorItem,
  AdminTopDoctorQuery,
  PagingResponse,
} from "../../api/dasboardApi";

interface AdminTopDoctorsState {
  loading: boolean;
  data: PagingResponse<AdminTopDoctorItem> | null;
  error: string | null;
}

const initialState: AdminTopDoctorsState = {
  loading: false,
  data: null,
  error: null,
};

// Helper function to get default date range
const getDefaultDateRange = () => {
  const today = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(today.getMonth() + 1);

  return {
    fromDate: today.toISOString().split("T")[0], // YYYY-MM-DD format
    toDate: oneMonthLater.toISOString().split("T")[0],
  };
};

// Async thunk
export const fetchTopDoctors = createAsyncThunk(
  "adminTopDoctors/fetchTopDoctors",
  async (params: Partial<AdminTopDoctorQuery> = {}, { rejectWithValue }) => {
    try {
      // Merge with default parameters
      const defaultRange = getDefaultDateRange();
      const queryParams = {
        topN: 10,
        ...defaultRange,
        ...params,
      };

      const response = await adminRevenueByDoctorApi.getTopDoctors(queryParams);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errorMessage || "Failed to fetch top doctors"
      );
    }
  }
);

// Slice
const adminTopDoctorsSlice = createSlice({
  name: "adminTopDoctors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTopDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminTopDoctorsSlice.reducer;
