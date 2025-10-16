import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { medicalFacilityAdminApi } from "../../api/apiEndPoint";

interface State {
  loading: boolean;
  error: string | null;
  success: boolean; // true nếu 204 thành công
  deletedId: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
  success: false,
  deletedId: null,
};

export const deleteAdminMedicalFacilityAsync = createAsyncThunk(
  "adminMedicalFacility/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await medicalFacilityAdminApi.deleteFacility(id); // 204 No Content
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage || "Xoá cơ sở y tế (admin) thất bại!"
      );
    }
  }
);

const adminMedicalFacilityDeleteSlice = createSlice({
  name: "adminMedicalFacilityDelete",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(deleteAdminMedicalFacilityAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
      s.success = false;
      s.deletedId = null;
    });
    b.addCase(deleteAdminMedicalFacilityAsync.fulfilled, (s, a) => {
      s.loading = false;
      s.success = true;
      s.deletedId = a.payload as string;
    });
    b.addCase(deleteAdminMedicalFacilityAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Unknown error";
      s.success = false;
    });
  },
});

export default adminMedicalFacilityDeleteSlice.reducer;
