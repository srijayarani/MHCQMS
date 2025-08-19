import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const AppointmentPortal = () => {
  const [searchData, setSearchData] = useState({
    unique_id: '',
    date_of_birth: null,
  });
  const [appointmentData, setAppointmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [createDialog, setCreateDialog] = useState({ open: false, patient: null });
  const [newAppointment, setNewAppointment] = useState({
    room_id: '',
    appointment_date: new Date(),
    estimated_wait_time: 30,
  });
  const [rooms, setRooms] = useState([]);
  const [patients, setPatients] = useState([]);

  const handleSearch = async () => {
    if (!searchData.unique_id || !searchData.date_of_birth) {
      setError('Please enter both Patient ID and Date of Birth');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await axios.post('http://localhost:8000/api/appointments/access-portal', {
        unique_id: searchData.unique_id,
        date_of_birth: searchData.date_of_birth.toISOString().split('T')[0],
      });
      setAppointmentData(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'Patient not found or invalid credentials');
      setAppointmentData(null);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = async (patient) => {
    try {
      const [roomsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/appointments/patient/available-rooms')
      ]);
      setRooms(roomsRes.data);
      setCreateDialog({ open: true, patient: appointmentData });
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      setError('Unable to fetch available rooms. Please try again.');
    }
  };

  const createAppointment = async () => {
    try {
      await axios.post('http://localhost:8000/api/appointments/patient/schedule', {
        unique_id: searchData.unique_id,
        date_of_birth: searchData.date_of_birth.toISOString().split('T')[0],
        room_id: newAppointment.room_id,
        appointment_date: newAppointment.appointment_date.toISOString(),
        estimated_wait_time: newAppointment.estimated_wait_time,
      });

      setCreateDialog({ open: false, patient: null });
      setNewAppointment({
        room_id: '',
        appointment_date: new Date(),
        estimated_wait_time: 30,
      });
      setError('');
      setSuccessMessage('Appointment scheduled successfully!');
      handleSearch(); // Refresh the search results
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError(error.response?.data?.detail || 'Failed to schedule appointment. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
        Patient Appointment Portal
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Access Appointment Information
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Patient Unique ID"
                  value={searchData.unique_id}
                  onChange={(e) => setSearchData(prev => ({ ...prev, unique_id: e.target.value }))}
                  placeholder="e.g., P20241201ABC12345"
                  helperText="Enter the unique patient ID provided during registration"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date of Birth"
                    value={searchData.date_of_birth}
                    onChange={(date) => setSearchData(prev => ({ ...prev, date_of_birth: date }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        helperText="Enter your date of birth (YYYY-MM-DD)"
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={loading || !searchData.unique_id || !searchData.date_of_birth}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
                textTransform: 'none',
                px: 4,
                py: 1.5,
              }}
            >
              {loading ? 'Searching...' : 'Search Appointments'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {successMessage}
              </Alert>
            )}

            {appointmentData && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Patient Information
                </Typography>

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                      {appointmentData.patient_name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      Welcome to the Healthcare Queue Management System
                    </Typography>
                  </CardContent>
                </Card>

                {appointmentData.next_appointment ? (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Next Appointment
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <TimeIcon color="primary" />
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {new Date(appointmentData.next_appointment.appointment_date).toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocationIcon color="primary" />
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              Room {appointmentData.room_number}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {appointmentData.estimated_wait_time && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Estimated Wait Time: {appointmentData.estimated_wait_time} minutes
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={appointmentData.next_appointment.status.toUpperCase()}
                          color={getStatusColor(appointmentData.next_appointment.status)}
                          size="medium"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ) : (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        No Upcoming Appointments
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        You don't have any scheduled appointments at the moment.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => openCreateDialog()}
                      >
                        Schedule New Appointment
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Note:</strong> Please arrive 15 minutes before your scheduled appointment time. 
                    Bring your patient ID and any required documents. If you need to reschedule or cancel, 
                    please contact the healthcare facility directly.
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              How to Access
            </Typography>
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              <li>Enter your unique Patient ID</li>
              <li>Provide your date of birth</li>
              <li>Click "Search Appointments"</li>
              <li>View your appointment details</li>
              <li>Check room number and timing</li>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Contact Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Emergency:</strong> 911
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Appointment Line:</strong> (555) 123-4567
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Hours:</strong> Mon-Fri 8:00 AM - 6:00 PM
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Dialog 
        open={createDialog.open} 
        onClose={() => setCreateDialog({ open: false, patient: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule New Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Scheduling appointment for: <strong>{appointmentData?.patient_name}</strong>
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Room</InputLabel>
              <Select
                value={newAppointment.room_id}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, room_id: e.target.value }))}
                label="Select Room"
              >
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.room_number} ({room.department?.name})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Appointment Date & Time"
                value={newAppointment.appointment_date}
                onChange={(date) => setNewAppointment(prev => ({ ...prev, appointment_date: date }))}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Estimated Wait Time (minutes)"
              type="number"
              value={newAppointment.estimated_wait_time}
              onChange={(e) => setNewAppointment(prev => ({ ...prev, estimated_wait_time: parseInt(e.target.value) }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog({ open: false, patient: null })}>
            Cancel
          </Button>
          <Button 
            onClick={createAppointment} 
            variant="contained"
            disabled={!newAppointment.room_id || !newAppointment.appointment_date}
          >
            Schedule Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentPortal;
