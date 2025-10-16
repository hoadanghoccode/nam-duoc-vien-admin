import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  medicalFacilityAdminApi,
  MedicalFacilityPaging,
} from "../../api/apiEndPoint";

interface State {
  loading: boolean;
  error: string | null;
  data: MedicalFacilityPaging | null;
}

const initialState: State = {
  loading: false,
  error: null,
  data: null,
};

export const getAdminMedicalFacilitiesAsync = createAsyncThunk(
  "adminMedicalFacility/getList",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      city?: string;
      district?: string;
      isActive?: boolean;
      specialtyId?: string;
      orderColumn?: string;
      orderDirection?: "asc" | "desc" | string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await medicalFacilityAdminApi.getFacilities(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage ||
          "Lấy danh sách cơ sở y tế (admin) thất bại!"
      );
    }
  }
);

const adminMedicalFacilitySlice = createSlice({
  name: "adminMedicalFacility",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(getAdminMedicalFacilitiesAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(getAdminMedicalFacilitiesAsync.fulfilled, (s, a) => {
      s.loading = false;
      s.data = a.payload as MedicalFacilityPaging;
    });
    b.addCase(getAdminMedicalFacilitiesAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Unknown error";
    });
  },
});

export default adminMedicalFacilitySlice.reducer;
