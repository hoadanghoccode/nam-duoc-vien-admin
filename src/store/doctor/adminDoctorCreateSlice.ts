import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminDoctorsApi, CreateAdminDoctorPayload, CreateAdminDoctorResponse } from "../../api/doctorApi";

interface State {
  loading: boolean;
  error: string | null;
  result: CreateAdminDoctorResponse | null; // dữ liệu trả về từ BE (thường có id)
  createdId?: string | null; // tiện lấy id nếu có
}

const initialState: State = {
  loading: false,
  error: null,
  result: null,
  createdId: null,
};

export const createAdminDoctorAsync = createAsyncThunk(
  "adminDoctor/create",
  async (payload: CreateAdminDoctorPayload, { rejectWithValue }) => {
    try {
      const res = await adminDoctorsApi.createDoctor(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage || "Tạo bác sĩ thất bại nhé!"
      );
    }
  }
);

const adminDoctorCreateSlice = createSlice({
  name: "adminDoctorCreate",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(createAdminDoctorAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
      s.createdId = null;
    });
    b.addCase(createAdminDoctorAsync.fulfilled, (s, a) => {
      s.loading = false;
      s.result = a.payload as CreateAdminDoctorResponse;
      s.createdId = (a.payload as any)?.id ?? null;
    });
    b.addCase(createAdminDoctorAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Unknown error";
    });
  },
});

export default adminDoctorCreateSlice.reducer;
