import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {getApiUrl} from '../../config/api';

export const generateReport = createAsyncThunk(
  'reports/generate',
  async (reportParams, {rejectWithValue}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        getApiUrl('/reports/patient-completion'),
        {
          headers: {Authorization: `Bearer ${token}`},
          params: reportParams,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to generate report'
      );
    }
  }
);

export const fetchPerformanceMetrics = createAsyncThunk(
  'reports/fetchMetrics',
  async (_, {rejectWithValue}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        getApiUrl('/reports/performance-metrics'),
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch metrics'
      );
    }
  }
);

export const fetchDepartmentEfficiency = createAsyncThunk(
  'reports/fetchEfficiency',
  async (_, {rejectWithValue}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        getApiUrl('/reports/department-efficiency'),
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch efficiency data'
      );
    }
  }
);

const initialState = {
  reportData: null,
  performanceMetrics: null,
  departmentEfficiency: [],
  loading: false,
  error: null,
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReportData: (state) => {
      state.reportData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reportData = action.payload;
        state.error = null;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
        state.performanceMetrics = action.payload;
      })
      .addCase(fetchDepartmentEfficiency.fulfilled, (state, action) => {
        state.departmentEfficiency = action.payload;
      });
  },
});

export const {clearError, clearReportData} = reportSlice.actions;
export default reportSlice.reducer;
