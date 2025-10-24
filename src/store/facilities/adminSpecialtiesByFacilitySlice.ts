import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminDoctorsApi, AdminSpecialty } from "../../api/doctorApi";

interface State {
  loading: boolean;
  error: string | null;
  items: AdminSpecialty[];
  facilityId?: string | null;
}

const initialState: State = {
  loading: false,
  error: null,
  items: [],
  facilityId: null,
};

export const getAdminSpecialtiesByFacilityAsync = createAsyncThunk(
  "adminSpecialty/byFacility",
  async (
    params: { facilityId: string; isActive?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const res = await adminDoctorsApi.getByFacility(
        params.facilityId,
        params.isActive ?? true
      );
      return { facilityId: params.facilityId, data: res.data };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.errorMessage ||
          "Lấy danh sách chuyên khoa theo cơ sở thất bại!"
      );
    }
  }
);

const adminSpecialtiesByFacilitySlice = createSlice({
  name: "adminSpecialtiesByFacility",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(getAdminSpecialtiesByFacilityAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(getAdminSpecialtiesByFacilityAsync.fulfilled, (s, a) => {
      s.loading = false;
      s.items = a.payload.data as AdminSpecialty[];
      s.facilityId = a.payload.facilityId;
    });
    b.addCase(getAdminSpecialtiesByFacilityAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Unknown error";
    });
  },
});

export default adminSpecialtiesByFacilitySlice.reducer;
