import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://mhcqms.onrender.com';

export const fetchQueueStatus = createAsyncThunk(
  'queue/fetchStatus',
  async (departmentId, {rejectWithValue}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/queue/status`, {
        headers: {Authorization: `Bearer ${token}`},
        params: {department_id: departmentId || undefined},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch queue status'
      );
    }
  }
);

export const updateTestStatus = createAsyncThunk(
  'queue/updateStatus',
  async (updateData, {rejectWithValue}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/queue/update-status`,
        updateData,
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to update status'
      );
    }
  }
);

export const fetchQueueMetrics = createAsyncThunk(
  'queue/fetchMetrics',
  async (_, {rejectWithValue}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/queue/metrics`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch metrics'
      );
    }
  }
);

const initialState = {
  queueData: [],
  metrics: null,
  loading: false,
  error: null,
};

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearQueueData: (state) => {
      state.queueData = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQueueStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQueueStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.queueData = action.payload;
        state.error = null;
      })
      .addCase(fetchQueueStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTestStatus.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(updateTestStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchQueueMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      });
  },
});

export const {clearError, clearQueueData} = queueSlice.actions;
export default queueSlice.reducer;
