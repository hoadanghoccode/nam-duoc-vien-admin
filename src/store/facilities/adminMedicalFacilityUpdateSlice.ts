import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { medicalFacilityAdminApi } from "../../api/apiEndPoint";

export type UpdateMedicalFacilityDto = {
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
  specialties?: { id: string; specialtyId: string }[];
};

export interface MedicalFacility {
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
  specialties: {
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
  }[];
}

interface State {
  loading: boolean;
  error: string | null;
  success: boolean;
  updatedFacility: MedicalFacility | null;
}

const initialState: State = {
  loading: false,
  error: null,
  success: false,
  updatedFacility: null,
};

export const updateAdminMedicalFacilityAsync = createAsyncThunk(
  "adminMedicalFacility/update",
  async (
    { id, payload }: { id: string; payload: UpdateMedicalFacilityDto },
    { rejectWithValue }
  ) => {
    try {
      const res = await medicalFacilityAdminApi.updateFacility(id, payload);
      return res.data as MedicalFacility;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage || "Cập nhật cơ sở y tế thất bại!"
      );
    }
  }
);

const adminMedicalFacilityUpdateSlice = createSlice({
  name: "adminMedicalFacilityUpdate",
  initialState,
  reducers: {
    resetAdminMedicalFacilityUpdate: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.updatedFacility = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateAdminMedicalFacilityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAdminMedicalFacilityAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedFacility = action.payload;
      })
      .addCase(updateAdminMedicalFacilityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Unknown error";
        state.success = false;
      });
  },
});

export default adminMedicalFacilityUpdateSlice.reducer;
