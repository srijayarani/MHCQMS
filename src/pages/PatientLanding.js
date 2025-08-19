import React from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const PatientLanding = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{mt: 4}}>
      <Box sx={{textAlign: 'center', mb: 6}}>
        <Typography
          variant="h3"
          component="h1"
          sx={{fontWeight: 'bold', mb: 2}}>
          🏥 MHCQMS Patient Services
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{mb: 4}}>
          Welcome to the Healthcare Queue Management System
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <CardContent sx={{flexGrow: 1}}>
              <Box sx={{textAlign: 'center', mb: 3}}>
                <PersonIcon sx={{fontSize: 60, color: 'primary.main', mb: 2}} />
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{fontWeight: 'bold', mb: 2}}>
                  Hospital User Login
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Register for patient with auto assign test, View Dashord for
                  QMS, manage queue management system, and Schedule new
                  appointments.
                </Typography>
              </Box>

              <Box sx={{mt: 3}}>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                  <strong>Features:</strong>
                </Typography>
                <Box component="ul" sx={{pl: 2, m: 0}}>
                  <li>Register for patient with auto assign test</li>
                  <li>View Dashord for QMS</li>
                  <li>Manage queue management system</li>
                  <li>Schedule new appointments</li>
                </Box>
              </Box>
            </CardContent>
            <CardActions sx={{justifyContent: 'center', pb: 3}}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                startIcon={<PersonIcon />}
                sx={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                }}>
                Access Hospital User Login
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <CardContent sx={{flexGrow: 1}}>
              <Box sx={{textAlign: 'center', mb: 3}}>
                <ScheduleIcon
                  sx={{fontSize: 60, color: 'success.main', mb: 2}}
                />
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{fontWeight: 'bold', mb: 2}}>
                  Patient Queue Portal
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  View your complete medical test history, upcoming tests, and
                  test results.
                </Typography>
              </Box>

              <Box sx={{mt: 3}}>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                  <strong>Features:</strong>
                </Typography>
                <Box component="ul" sx={{pl: 2, m: 0}}>
                  <li>View upcoming medical tests</li>
                  <li>Check completed test history</li>
                  <li>See test room assignments</li>
                  <li>Track test status and progress</li>
                </Box>
              </Box>
            </CardContent>
            <CardActions sx={{justifyContent: 'center', pb: 3}}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/patient-portal')}
                startIcon={<ScheduleIcon />}
                sx={{
                  background:
                    'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                  },
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                }}>
                Access Patient Portal
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{mt: 6}}>
        <Alert severity="info" icon={<InfoIcon />}>
          <Typography variant="body1" sx={{fontWeight: 'bold', mb: 1}}>
            How to Access Your Information
          </Typography>
          <Typography variant="body2">
            You'll need your unique Patient ID (UHID) and date of birth to
            access either portal. If you don't have your UHID, please contact
            the healthcare facility or visit the patient registration desk.
          </Typography>
        </Alert>
      </Box>

      <Box sx={{mt: 4, textAlign: 'center'}}>
        <Typography variant="body2" color="text.secondary">
          <strong>Need Help?</strong> Contact Patient Support at (555) 123-4567
          or visit the information desk.
        </Typography>
      </Box>
    </Container>
  );
};

export default PatientLanding;
