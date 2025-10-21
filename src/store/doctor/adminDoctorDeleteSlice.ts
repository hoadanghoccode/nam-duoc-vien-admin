import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminDoctorsApi } from "../../api/doctorApi";

interface State {
  loading: boolean;
  error: string | null;
  success: boolean;
  deletedId?: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
  success: false,
  deletedId: null,
};

export const deleteAdminDoctorAsync = createAsyncThunk(
  "adminDoctor/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await adminDoctorsApi.deleteDoctor(id);
      return res;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Xóa bác sĩ thất bại!"
      );
    }
  }
);

const adminDoctorDeleteSlice = createSlice({
  name: "adminDoctorDelete",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(deleteAdminDoctorAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
      s.success = false;
      s.deletedId = null;
    });
    b.addCase(deleteAdminDoctorAsync.fulfilled, (s, _a) => {
      s.loading = false;
      s.success = true;
      //   s.deletedId = a.payload as string;
    });
    b.addCase(deleteAdminDoctorAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Unknown error";
    });
  },
});

export default adminDoctorDeleteSlice.reducer;
