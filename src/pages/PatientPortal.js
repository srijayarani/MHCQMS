import React, {useState} from 'react';
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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  PlayArrow as PlayIcon,
  ExpandMore as ExpandMoreIcon,
  MedicalServices as TestIcon,
} from '@mui/icons-material';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const PatientPortal = () => {
  const [searchData, setSearchData] = useState({
    unique_id: '',
    date_of_birth: null,
  });
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const handleSearch = async () => {
    if (!searchData.unique_id || !searchData.date_of_birth) {
      setError('Please enter both Patient ID and Date of Birth');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        'https://mhcqms.onrender.com/appointments/patient-portal',
        {
          unique_id: searchData.unique_id,
          date_of_birth: searchData.date_of_birth.toISOString().split('T')[0],
        }
      );
      setPortalData(response.data);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          'Patient not found or invalid credentials'
      );
      setPortalData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <PendingIcon />;
      case 'in_progress':
        return <PlayIcon />;
      case 'completed':
        return <CheckIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <Container maxWidth="lg" sx={{mt: 4}}>
      <Typography variant="h4" component="h1" sx={{mb: 4, fontWeight: 'bold'}}>
        Patient Portal
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{p: 4}}>
            <Typography variant="h6" sx={{mb: 3, fontWeight: 'bold'}}>
              <SearchIcon sx={{mr: 1, verticalAlign: 'middle'}} />
              Access Your Medical Records
            </Typography>

            <Grid container spacing={3} sx={{mb: 3}}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Patient Unique ID (UHID)"
                  value={searchData.unique_id}
                  onChange={(e) =>
                    setSearchData((prev) => ({
                      ...prev,
                      unique_id: e.target.value,
                    }))
                  }
                  placeholder="e.g., P20241201ABC12345"
                  helperText="Enter the unique patient ID provided during registration"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date of Birth"
                    value={searchData.date_of_birth}
                    onChange={(date) =>
                      setSearchData((prev) => ({...prev, date_of_birth: date}))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        helperText="Enter your date of birth"
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
              disabled={
                loading || !searchData.unique_id || !searchData.date_of_birth
              }
              startIcon={
                loading ? <CircularProgress size={20} /> : <SearchIcon />
              }
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
                textTransform: 'none',
                px: 4,
                py: 1.5,
              }}>
              {loading ? 'Accessing Portal...' : 'Access Portal'}
            </Button>

            {error && (
              <Alert severity="error" sx={{mt: 3}}>
                {error}
              </Alert>
            )}

            {portalData && (
              <Box sx={{mt: 4}}>
                <Divider sx={{mb: 3}} />

                <Typography variant="h6" sx={{mb: 3, fontWeight: 'bold'}}>
                  <PersonIcon sx={{mr: 1, verticalAlign: 'middle'}} />
                  Welcome, {portalData.patient_name}
                </Typography>

                <Card sx={{mb: 3}}>
                  <CardContent>
                    <Typography variant="h5" sx={{mb: 2, fontWeight: 'bold'}}>
                      {portalData.patient_name}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{mb: 2}}>
                      UHID: {portalData.unique_id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Welcome to your personal healthcare portal. View your
                      upcoming and completed medical tests.
                    </Typography>
                  </CardContent>
                </Card>

                <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab
                      label={`Upcoming Tests (${portalData.upcoming_tests.length})`}
                      icon={<ScheduleIcon />}
                      iconPosition="start"
                    />
                    <Tab
                      label={`Completed Tests (${portalData.completed_tests.length})`}
                      icon={<CheckIcon />}
                      iconPosition="start"
                    />
                  </Tabs>
                </Box>

                {activeTab === 0 && (
                  <Box>
                    {portalData.upcoming_tests.length === 0 ? (
                      <Alert severity="info">
                        No upcoming tests scheduled at the moment.
                      </Alert>
                    ) : (
                      <List>
                        {portalData.upcoming_tests.map((test, index) => (
                          <Accordion key={index} sx={{mb: 2}}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  width: '100%',
                                }}>
                                <ListItemIcon>
                                  {getStatusIcon(test.status)}
                                </ListItemIcon>
                                <Box sx={{flex: 1}}>
                                  <Typography
                                    variant="h6"
                                    sx={{fontWeight: 'bold'}}>
                                    {test.test_name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    {test.department} Department
                                  </Typography>
                                </Box>
                                <Chip
                                  label={test.status
                                    .replace('_', ' ')
                                    .toUpperCase()}
                                  color={getStatusColor(test.status)}
                                  size="small"
                                />
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    <strong>Test:</strong> {test.test_name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    <strong>Department:</strong>{' '}
                                    {test.department}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    <strong>Status:</strong>{' '}
                                    {test.status.replace('_', ' ')}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    <strong>Room:</strong>{' '}
                                    {test.room_number || 'Not assigned'}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    <strong>Assigned:</strong>{' '}
                                    {formatDateTime(test.assigned_at)}
                                  </Typography>
                                  {test.started_at && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary">
                                      <strong>Started:</strong>{' '}
                                      {formatDateTime(test.started_at)}
                                    </Typography>
                                  )}
                                </Grid>
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </List>
                    )}
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box>
                    {portalData.completed_tests.length === 0 ? (
                      <Alert severity="info">No completed tests found.</Alert>
                    ) : (
                      <List>
                        {portalData.completed_tests.map((test, index) => (
                          <Accordion key={index} sx={{mb: 2}}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  width: '100%',
                                }}>
                                <ListItemIcon>
                                  <CheckIcon color="success" />
                                </ListItemIcon>
                                <Box sx={{flex: 1}}>
                                  <Typography
                                    variant="h6"
                                    sx={{fontWeight: 'bold'}}>
                                    {test.test_name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    {test.department} Department
                                  </Typography>
                                </Box>
                                <Chip
                                  label="COMPLETED"
                                  color="success"
                                  size="small"
                                />
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    <strong>Test:</strong> {test.test_name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    <strong>Department:</strong>{' '}
                                    {test.department}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    <strong>Room:</strong>{' '}
                                    {test.room_number || 'N/A'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    <strong>Assigned:</strong>{' '}
                                    {formatDateTime(test.assigned_at)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    <strong>Started:</strong>{' '}
                                    {formatDateTime(test.started_at)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    <strong>Completed:</strong>{' '}
                                    {formatDateTime(test.completed_at)}
                                  </Typography>
                                </Grid>
                                {test.notes && (
                                  <Grid item xs={12}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary">
                                      <strong>Notes:</strong> {test.notes}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{p: 3, mb: 3}}>
            <Typography variant="h6" sx={{mb: 2, fontWeight: 'bold'}}>
              How to Access
            </Typography>
            <Box component="ol" sx={{pl: 2, m: 0}}>
              <li>Enter your unique Patient ID (UHID)</li>
              <li>Provide your date of birth</li>
              <li>Click "Access Portal"</li>
              <li>View upcoming and completed tests</li>
              <li>Check test details and room numbers</li>
            </Box>
          </Paper>

          <Paper sx={{p: 3, mb: 3}}>
            <Typography variant="h6" sx={{mb: 2, fontWeight: 'bold'}}>
              Test Status Guide
            </Typography>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <PendingIcon color="warning" />
                <Typography variant="body2">
                  Pending - Test scheduled
                </Typography>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <PlayIcon color="info" />
                <Typography variant="body2">
                  In Progress - Test ongoing
                </Typography>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <CheckIcon color="success" />
                <Typography variant="body2">
                  Completed - Test finished
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{p: 3}}>
            <Typography variant="h6" sx={{mb: 2, fontWeight: 'bold'}}>
              Contact Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
              <strong>Emergency:</strong> 911
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
              <strong>Patient Support:</strong> (555) 123-4567
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Hours:</strong> Mon-Fri 8:00 AM - 6:00 PM
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientPortal;
