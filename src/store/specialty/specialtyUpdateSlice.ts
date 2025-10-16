import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { specialtyApi } from "../../api/apiEndPoint";

export type UpdateSpecialtyDto = {
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

interface SpecialtyUpdateState {
  loading: boolean;
  error: string | null;
  data: Specialty | null; // record sau khi update
}

const initialState: SpecialtyUpdateState = {
  loading: false,
  error: null,
  data: null,
};

export const updateSpecialtyAsync = createAsyncThunk(
  "specialty/update",
  async (
    { id, payload }: { id: string; payload: UpdateSpecialtyDto },
    { rejectWithValue }
  ) => {
    try {
      const res = await specialtyApi.updateSpecialty(id, payload);
      return res.data as Specialty;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage || "Cập nhật Specialty thất bại!"
      );
    }
  }
);

const specialtyUpdateSlice = createSlice({
  name: "specialtyUpdate",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateSpecialtyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSpecialtyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload as Specialty;
      })
      .addCase(updateSpecialtyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Unknown error";
      });
  },
});

export default specialtyUpdateSlice.reducer;
