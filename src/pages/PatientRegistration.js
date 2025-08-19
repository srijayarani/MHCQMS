import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PersonAdd as PersonAddIcon, Assessment as AssessmentIcon } from '@mui/icons-material';
import axios from 'axios';

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: null,
    gender: '',
    phone: '',
    email: '',
    address: '',
    smoking: false,
    diabetes: false,
    hypertension: false,
    obesity: false,
    family_history: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  const calculateRiskLevel = () => {
    let riskScore = 0;
    
    if (formData.smoking) riskScore += 2;
    if (formData.diabetes) riskScore += 2;
    if (formData.hypertension) riskScore += 2;
    if (formData.obesity) riskScore += 1;
    if (formData.family_history) riskScore += 1;
    
    if (formData.date_of_birth) {
      const age = new Date().getFullYear() - formData.date_of_birth.getFullYear();
      if (age > 60) riskScore += 2;
      else if (age > 40) riskScore += 1;
    }
    
    if (riskScore >= 5) return { level: 'high', color: 'error' };
    if (riskScore >= 3) return { level: 'medium', color: 'warning' };
    return { level: 'low', color: 'success' };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/patients/register', {
        ...formData,
        date_of_birth: formData.date_of_birth.toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRegistrationResult(response.data);
      setSuccess(true);
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: null,
        gender: '',
        phone: '',
        email: '',
        address: '',
        smoking: false,
        diabetes: false,
        hypertension: false,
        obesity: false,
        family_history: false,
      });
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.response?.data?.detail || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const riskInfo = calculateRiskLevel();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
        Patient Registration
      </Typography>

      {success && registrationResult && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Patient registered successfully! Unique ID: {registrationResult.patient.unique_id}
        </Alert>
      )}

      {errors.submit && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.submit}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Patient Information
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData.date_of_birth}
                      onChange={(date) => handleChange('date_of_birth', date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!errors.date_of_birth}
                          helperText={errors.date_of_birth}
                          required
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.gender} required>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      label="Gender"
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Risk Factors Assessment
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.smoking}
                        onChange={(e) => handleChange('smoking', e.target.checked)}
                      />
                    }
                    label="Smoking"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.diabetes}
                        onChange={(e) => handleChange('diabetes', e.target.checked)}
                      />
                    }
                    label="Diabetes"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.hypertension}
                        onChange={(e) => handleChange('hypertension', e.target.checked)}
                      />
                    }
                    label="Hypertension"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.obesity}
                        onChange={(e) => handleChange('obesity', e.target.checked)}
                      />
                    }
                    label="Obesity"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.family_history}
                        onChange={(e) => handleChange('family_history', e.target.checked)}
                      />
                    }
                    label="Family History"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1">Risk Level:</Typography>
                <Chip
                  label={riskInfo.level.toUpperCase()}
                  color={riskInfo.color}
                  size="medium"
                />
              </Box>

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
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
                  {loading ? 'Registering...' : 'Register Patient'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Risk Assessment Guide
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The system automatically calculates risk level based on:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Age (40+ = +1, 60+ = +2)</li>
                <li>Smoking (+2)</li>
                <li>Diabetes (+2)</li>
                <li>Hypertension (+2)</li>
                <li>Obesity (+1)</li>
                <li>Family History (+1)</li>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Risk Levels:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip label="LOW (0-2)" color="success" size="small" />
                  <Chip label="MEDIUM (3-4)" color="warning" size="small" />
                  <Chip label="HIGH (5+)" color="error" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {registrationResult && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Registration Summary
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Patient ID:</strong> {registrationResult.patient.unique_id}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {registrationResult.patient.first_name} {registrationResult.patient.last_name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Risk Level:</strong> {registrationResult.risk_level}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Tests Assigned:</strong> {registrationResult.assigned_tests.length}
                </Typography>
                <Typography variant="body2" color="success.main">
                  {registrationResult.message}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientRegistration;
