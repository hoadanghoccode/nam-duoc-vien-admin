import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { authen } from "../../api/apiEndPoint";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: any | null;
  loading: boolean;
  error: string | null;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponseSuccess {
  status: number;
  data: {
    accessToken: string;
    refreshToken: string;
    user: any;
  };
}
interface LoginResponseError {
  status: number;
  message: string;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: null,
  loading: false,
  error: null,
};

// Create async thunk for login
export const loginAsync = createAsyncThunk<
  LoginResponseSuccess, // fulfilled
  LoginPayload, // argument
  {
    rejectValue: LoginResponseError; // rejected
  }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await authen.login(credentials);

    console.log("Login response data:", response.data);

    localStorage.setItem("refreshToken", response.data.content.refreshToken);
    localStorage.setItem("accessToken", response.data.content.token);

    return response;
  } catch (err: any) {
    if (err?.response) {
      return rejectWithValue({
        status: err.response.status,
        message:
          err.response.data?.errorMessage ||
          err.response.data?.message ||
          err.message ||
          "Đã xảy ra lỗi!",
      });
    }
    return rejectWithValue({
      status: 0,
      message: err.message || "Đã xảy ra lỗi!",
    });
  }
});

// Create async thunk for logout
export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("recentlyViewedProducts");
      localStorage.removeItem("recentlyViewedProducts");
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setAccessToken(state, action: PayloadAction<string | null>) {
      console.log("setAccessToken", action.payload);
      state.accessToken = action.payload;
    },
    clearTokens: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.data.accessToken;
        state.user = action.payload.data.user;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? action.payload.message
          : action.error.message ?? "Đã xảy ra lỗi!";
      })
      // Handle logout
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.accessToken = null;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTokens, setAccessToken, clearTokens } = authSlice.actions;
export default authSlice.reducer;
