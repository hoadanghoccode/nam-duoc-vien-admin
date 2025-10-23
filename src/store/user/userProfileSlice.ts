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

// Cập nhật profile
export const updateMyProfileAsync = createAsyncThunk(
  "userProfile/updateMyProfile",
  async (data: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await adminUsersApi.updateMyProfile(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errorMessage || "Cập nhật thông tin thất bại!"
      );
    }
  }
);

// Cập nhật avatar
export const updateAvatarAsync = createAsyncThunk(
  "userProfile/updateAvatar",
  async (imageUrl: string, { rejectWithValue }) => {
    try {
      const response = await adminUsersApi.updateMyProfile({ imageUrl });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errorMessage || "Cập nhật avatar thất bại!"
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
      })
      // Update profile
      .addCase(updateMyProfileAsync.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateMyProfileAsync.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        state.updateSuccess = true;
        state.profile = action.payload;
      })
      .addCase(updateMyProfileAsync.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = (action.payload as string) || "Cập nhật thất bại!";
        state.updateSuccess = false;
      })
      // Update avatar
      .addCase(updateAvatarAsync.pending, (state) => {
        state.avatarUploadLoading = true;
        state.avatarUploadError = null;
      })
      .addCase(updateAvatarAsync.fulfilled, (state, action) => {
        state.avatarUploadLoading = false;
        state.avatarUploadError = null;
        state.profile = action.payload;
      })
      .addCase(updateAvatarAsync.rejected, (state, action) => {
        state.avatarUploadLoading = false;
        state.avatarUploadError = (action.payload as string) || "Cập nhật avatar thất bại!";
      });
  },
});

export const { resetUpdateState, resetAvatarUploadState, clearProfile } =
  userProfileSlice.actions;
export default userProfileSlice.reducer;

