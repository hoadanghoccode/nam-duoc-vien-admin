// src/store/authen/authSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authen } from 'src/api/apiEndPoint';

interface RegisterResponse {
  statusCode?: number;
  data?: any;
}

interface RegisterError {
  statusCode?: number;
  errorMessage?: string;
  [key: string]: any;
}

interface RegisterState {
  loading: boolean;
  error: RegisterError | null;
  success: boolean;
  response: RegisterResponse | null;
}

const initialState: RegisterState = {
  loading: false,
  error: null,
  success: false,
  response: null,
};

// Async thunk cho đăng ký
export const registerAsync = createAsyncThunk(
  'auth/register',
  async (
    data: {
      displayName: string;
      password: string;
      email: string;
      phone: string;
      date_of_birth: string;
      gender: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await authen.register(data);
      return {
        statusCode: response.status,
        data: response.data,
      };
    } catch (err: any) {
      const statusCode = err?.response?.status || 0;
      const errorMessage =
        err?.response?.data?.errorMessage ||
        err?.response?.data?.message ||
        err.message ||
        'Đăng ký thất bại!';
      return rejectWithValue({
        statusCode,
        ...err?.response?.data,
        errorMessage,
      });
    }
  },
);

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    resetRegisterState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.response = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.response = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = true;
        state.response = action.payload; // { statusCode, data }
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as RegisterError;
        state.success = false;
        state.response = null;
      });
  },
});

export const { resetRegisterState } = registerSlice.actions;
export default registerSlice.reducer;
