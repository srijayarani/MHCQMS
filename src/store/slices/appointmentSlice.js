import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://mhcqms.onrender.com';

export const accessAppointmentPortal = createAsyncThunk(
  'appointments/accessPortal',
  async (accessData, {rejectWithValue}) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/appointments/access-portal`,
        accessData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Access denied');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData, {rejectWithValue}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/appointments/create`,
        appointmentData,
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to create appointment'
      );
    }
  }
);

export const fetchAppointments = createAsyncThunk(
  'appointments/fetch',
  async (params, {rejectWithValue}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/appointments/`, {
        headers: {Authorization: `Bearer ${token}`},
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch appointments'
      );
    }
  }
);

const initialState = {
  appointmentData: null,
  appointments: [],
  loading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAppointmentData: (state) => {
      state.appointmentData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(accessAppointmentPortal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(accessAppointmentPortal.fulfilled, (state, action) => {
        state.loading = false;
        state.appointmentData = action.payload;
        state.error = null;
      })
      .addCase(accessAppointmentPortal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAppointment.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.appointments = action.payload;
      });
  },
});

export const {clearError, clearAppointmentData} = appointmentSlice.actions;
export default appointmentSlice.reducer;
