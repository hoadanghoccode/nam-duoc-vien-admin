import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { specialtyApi } from "../../api/apiEndPoint";

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

export interface SpecialtyPaging {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  orderColumn: string | null;
  orderDirection: "asc" | "desc" | string | null;
  items: Specialty[];
}

interface SpecialtyState {
  loading: boolean;
  error: string | null;
  data: SpecialtyPaging | null;
}

const initialState: SpecialtyState = {
  loading: false,
  error: null,
  data: null,
};

// Lấy danh sách chuyên khoa (format giống getVouchersAsync)
export const getSpecialtiesAsync = createAsyncThunk(
  "specialty/getSpecialties",
  async (
    params: {
      page?: number;
      limit?: number;
      orderColumn?: string;
      orderDirection?: "asc" | "desc" | string;
      search?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await specialtyApi.getListSpecialties(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Lấy specialties thất bại!"
      );
    }
  }
);

const specialtySlice = createSlice({
  name: "specialty",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSpecialtiesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSpecialtiesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload as SpecialtyPaging;
      })
      .addCase(getSpecialtiesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Unknown error";
      });
  },
});

export default specialtySlice.reducer;
