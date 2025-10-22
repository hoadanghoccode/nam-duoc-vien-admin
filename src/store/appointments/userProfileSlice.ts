import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminUsersApi, UserProfile } from "../../api/adminUsersApi";

interface UserProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  avatarUploadLoading: boolean;
  avatarUploadError: string | null;
}

const initialState: UserProfileState = {
  profile: null,
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  avatarUploadLoading: false,
  avatarUploadError: null,
};

// Lấy thông tin profile
export const getMyProfileAsync = createAsyncThunk(
  "userProfile/getMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminUsersApi.getMyProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errorMessage || "Lấy thông tin thất bại!"
      );
    }
  }
);

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    resetUpdateState: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
    resetAvatarUploadState: (state) => {
      state.avatarUploadLoading = false;
      state.avatarUploadError = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
      state.avatarUploadLoading = false;
      state.avatarUploadError = null;
    },
  },
  extraReducers: (builder) => {
    // Get profile
    builder
      .addCase(getMyProfileAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyProfileAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.profile = action.payload;
      })
      .addCase(getMyProfileAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Lấy thông tin thất bại!";
      });
  },
});

export const { resetUpdateState, resetAvatarUploadState, clearProfile } =
  userProfileSlice.actions;
export default userProfileSlice.reducer;
