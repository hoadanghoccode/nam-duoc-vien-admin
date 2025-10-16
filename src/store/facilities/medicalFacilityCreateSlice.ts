import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { medicalFacilityAdminApi } from "../../api/apiEndPoint";

export type CreateMedicalFacilityDto = {
  facilityName: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  imageURL?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  specialtyIds?: string[];
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
  specialties: Array<{
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
  }>;
};

interface State {
  loading: boolean;
  error: string | null;
  data: MedicalFacility | null; // record vừa tạo
}

const initialState: State = {
  loading: false,
  error: null,
  data: null,
};

export const createMedicalFacilityAsync = createAsyncThunk(
  "medicalFacility/create",
  async (payload: CreateMedicalFacilityDto, { rejectWithValue }) => {
    try {
      const res = await medicalFacilityAdminApi.createFacility(payload);
      return res.data as MedicalFacility;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage || "Tạo cơ sở y tế thất bại!"
      );
    }
  }
);

const medicalFacilityCreateSlice = createSlice({
  name: "medicalFacilityCreate",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(createMedicalFacilityAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(createMedicalFacilityAsync.fulfilled, (s, a) => {
      s.loading = false;
      s.data = a.payload as MedicalFacility;
    });
    b.addCase(createMedicalFacilityAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Unknown error";
    });
  },
});

export default medicalFacilityCreateSlice.reducer;
