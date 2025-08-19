import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {getApiUrl} from '../../config/api';

export const registerPatient = createAsyncThunk(
  'patients/register',
  async (patientData, {rejectWithValue}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        getApiUrl('/patients/register'),
        patientData,
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Registration failed'
      );
    }
  }
);

export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (_, {rejectWithValue}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(getApiUrl('/patients/'), {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch patients'
      );
    }
  }
);

const initialState = {
  patients: [],
  loading: false,
  error: null,
  registrationResult: null,
};

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationResult: (state) => {
      state.registrationResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationResult = action.payload;
        state.error = null;
      })
      .addCase(registerPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {clearError, clearRegistrationResult} = patientSlice.actions;
export default patientSlice.reducer;
