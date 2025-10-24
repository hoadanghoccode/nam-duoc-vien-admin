// store/slices/adminRevenueByDoctorSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  adminRevenueByDoctorApi,
  AdminRevenueByDoctorItem,
  AdminRevenueByDoctorQuery,
  PagingResponse,
} from "../../api/dasboardApi";

interface AdminRevenueByDoctorState {
  loading: boolean;
  data: PagingResponse<AdminRevenueByDoctorItem> | null;
  error: string | null;
}

const initialState: AdminRevenueByDoctorState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk
export const fetchRevenueByDoctor = createAsyncThunk(
  "adminRevenueByDoctor/fetchRevenueByDoctor",
  async (params: AdminRevenueByDoctorQuery, { rejectWithValue }) => {
    try {
      const response = await adminRevenueByDoctorApi.getRevenueByDoctor(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errorMessage ||
          "Failed to fetch revenue by doctor"
      );
    }
  }
);

// Slice
const adminRevenueByDoctorSlice = createSlice({
  name: "adminRevenueByDoctor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenueByDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueByDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRevenueByDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminRevenueByDoctorSlice.reducer;
