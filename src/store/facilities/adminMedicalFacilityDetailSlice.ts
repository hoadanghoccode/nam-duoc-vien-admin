import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { medicalFacilityAdminApi } from "../../api/apiEndPoint";

export type FacilitySpecialty = {
  id: string;
  specialty: {
    id: string;
    specialtyName: string;
    specialtyCode: string;
    description: string;
    imageURL: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  isActive: boolean;
};

export type MedicalFacility = {
  id: string;
  facilityName: string;
  facilityCode: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  imageURL: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  specialties: FacilitySpecialty[];
};

interface State {
  loading: boolean;
  error: string | null;
  data: MedicalFacility | null;
}

const initialState: State = { loading: false, error: null, data: null };

export const getAdminMedicalFacilityDetailAsync = createAsyncThunk(
  "adminMedicalFacility/detail",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await medicalFacilityAdminApi.getFacilityById(id);
      return res.data as MedicalFacility;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage ||
          "Lấy chi tiết cơ sở y tế (admin) thất bại!"
      );
    }
  }
);

const adminMedicalFacilityDetailSlice = createSlice({
  name: "adminMedicalFacilityDetail",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(getAdminMedicalFacilityDetailAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(getAdminMedicalFacilityDetailAsync.fulfilled, (s, a) => {
      s.loading = false;
      s.data = a.payload as MedicalFacility;
    });
    b.addCase(getAdminMedicalFacilityDetailAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Unknown error";
    });
  },
});

export default adminMedicalFacilityDetailSlice.reducer;
