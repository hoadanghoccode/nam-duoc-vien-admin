import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { specialtyApi } from "../../api/apiEndPoint";

// Reuse cùng type Specialty đã định nghĩa trong apiEndPoint
export interface Specialty {
  id: string;
  specialtyName: string;
  specialtyCode: string;
  description: string;
  imageURL: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SpecialtyDetailState {
  loading: boolean;
  error: string | null;
  data: Specialty | null;
}

const initialState: SpecialtyDetailState = {
  loading: false,
  error: null,
  data: null,
};

export const getSpecialtyDetailAsync = createAsyncThunk(
  "specialtyDetail/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await specialtyApi.getSpecialtyById(id);
      return res.data as Specialty;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Lấy chi tiết Specialty thất bại!"
      );
    }
  }
);

const specialtyDetailSlice = createSlice({
  name: "specialtyDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSpecialtyDetailAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSpecialtyDetailAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload as Specialty;
      })
      .addCase(getSpecialtyDetailAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Unknown error";
      });
  },
});

export default specialtyDetailSlice.reducer;
