import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AdminDoctorPaging, adminDoctorsApi } from "../../api/doctorApi";

interface State {
  loading: boolean;
  error: string | null;
  data: AdminDoctorPaging | null;
}

const initialState: State = { loading: false, error: null, data: null };

export const getAdminDoctorsAsync = createAsyncThunk(
  "adminDoctors/getList",
  async (
    params: {
      searchTerm?: string;
      facilityId?: string;
      specialtyId?: string;
      isActive?: boolean;
      doctorTitle?: string;
      page?: number;
      limit?: number;
      orderColumn?: string;
      orderDirection?: "asc" | "desc" | string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await adminDoctorsApi.getDoctors(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage || "Lấy danh sách bác sĩ (admin) thất bại!"
      );
    }
  }
);

const adminDoctorsSlice = createSlice({
  name: "adminDoctors",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(getAdminDoctorsAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(getAdminDoctorsAsync.fulfilled, (s, a) => {
      s.loading = false;
      s.data = a.payload as AdminDoctorPaging;
    });
    b.addCase(getAdminDoctorsAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Unknown error";
    });
  },
});

export default adminDoctorsSlice.reducer;
