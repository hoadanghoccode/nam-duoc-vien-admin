import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  adminDoctorsApi,
  UpdateAdminDoctorPayload,
  UpdateAdminDoctorResponse,
} from "../../api/doctorApi";

interface State {
  loading: boolean;
  error: string | null;
  result: UpdateAdminDoctorResponse | null;
  updatedId?: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
  result: null,
  updatedId: null,
};

export const updateAdminDoctorAsync = createAsyncThunk(
  "adminDoctor/update",
  async (payload: UpdateAdminDoctorPayload, { rejectWithValue }) => {
    try {
      const res = await adminDoctorsApi.updateDoctor(payload.id, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage || "Cập nhật bác sĩ thất bại!"
      );
    }
  }
);

const adminDoctorUpdateSlice = createSlice({
  name: "adminDoctorUpdate",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(updateAdminDoctorAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
      s.updatedId = null;
    });
    b.addCase(updateAdminDoctorAsync.fulfilled, (s, a) => {
      s.loading = false;
      s.result = a.payload as UpdateAdminDoctorResponse;
      s.updatedId = (a.payload as any)?.id ?? null;
    });
    b.addCase(updateAdminDoctorAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Unknown error";
    });
  },
});

export default adminDoctorUpdateSlice.reducer;
