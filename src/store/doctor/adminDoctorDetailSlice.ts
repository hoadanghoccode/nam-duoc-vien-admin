import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AdminDoctorDetail, adminDoctorsApi } from "../../api/doctorApi";

interface State {
  loading: boolean;
  error: string | null;
  data: AdminDoctorDetail | null;
}

const initialState: State = { loading: false, error: null, data: null };

export const getAdminDoctorDetailAsync = createAsyncThunk(
  "adminDoctor/detail",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await adminDoctorsApi.getDoctorById(id);
      return res.data as AdminDoctorDetail;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage || "Lấy chi tiết bác sĩ (admin) thất bại!"
      );
    }
  }
);

const adminDoctorDetailSlice = createSlice({
  name: "adminDoctorDetail",
  initialState,
  reducers: {
    clearDoctorDetail: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (b) => {
    b.addCase(getAdminDoctorDetailAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(getAdminDoctorDetailAsync.fulfilled, (s, a) => {
      s.loading = false;
      s.data = a.payload as AdminDoctorDetail;
    });
    b.addCase(getAdminDoctorDetailAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Unknown error";
    });
  },
});

export const { clearDoctorDetail } = adminDoctorDetailSlice.actions;
export default adminDoctorDetailSlice.reducer;
