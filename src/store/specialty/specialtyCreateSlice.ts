import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { specialtyApi } from "../../api/apiEndPoint";

// Đồng bộ type với apiEndPoint
export type CreateSpecialtyDto = {
  specialtyName: string;
  description?: string;
  imageURL?: string;
  displayOrder?: number;
  isActive?: boolean;
};

export type Specialty = {
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

interface SpecialtyCreateState {
  loading: boolean;
  error: string | null;
  data: Specialty | null; // Specialty vừa tạo
}

const initialState: SpecialtyCreateState = {
  loading: false,
  error: null,
  data: null,
};

export const createSpecialtyAsync = createAsyncThunk(
  "specialty/create",
  async (payload: CreateSpecialtyDto, { rejectWithValue }) => {
    try {
      const res = await specialtyApi.createSpecialty(payload);
      return res.data; // Specialty
    } catch (err: any) {
        return rejectWithValue(
          err?.response?.data?.errorMessage || "Tạo Specialty thất bại!"
        );
    }
  }
);

const specialtyCreateSlice = createSlice({
  name: "specialtyCreate",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createSpecialtyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSpecialtyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload as Specialty;
      })
      .addCase(createSpecialtyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Unknown error";
      });
  },
});

export default specialtyCreateSlice.reducer;
