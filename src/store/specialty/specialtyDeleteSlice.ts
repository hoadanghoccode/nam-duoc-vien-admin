import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { specialtyApi } from "../../api/apiEndPoint";

interface SpecialtyDeleteState {
  loading: boolean;
  error: string | null;
  success: boolean; // true nếu xoá 204 thành công
  deletedId: string | null;
}

const initialState: SpecialtyDeleteState = {
  loading: false,
  error: null,
  success: false,
  deletedId: null,
};

export const deleteSpecialtyAsync = createAsyncThunk(
  "specialty/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await specialtyApi.deleteSpecialty(id); // 204 No Content
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage || "Xoá Specialty thất bại!"
      );
    }
  }
);

const specialtyDeleteSlice = createSlice({
  name: "specialtyDelete",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deleteSpecialtyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.deletedId = null;
      })
      .addCase(deleteSpecialtyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.deletedId = action.payload as string;
      })
      .addCase(deleteSpecialtyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Unknown error";
        state.success = false;
      });
  },
});

export default specialtyDeleteSlice.reducer;
