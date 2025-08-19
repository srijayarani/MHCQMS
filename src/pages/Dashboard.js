import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Container,
} from '@mui/material';
import {
  People as PeopleIcon,
  Queue as QueueIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    totalTests: 0,
    completedTests: 0,
    pendingTests: 0,
    inProgressTests: 0,
    completionRate: 0,
    avgWaitTime: 0,
    avgTestDuration: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [metricsRes, queueRes] = await Promise.all([
        axios.get('https://mhcqms.onrender.com/reports/performance-metrics', {
          headers: {Authorization: `Bearer ${token}`},
        }),
        axios.get('https://mhcqms.onrender.com/queue/metrics', {
          headers: {Authorization: `Bearer ${token}`},
        }),
      ]);

      setMetrics({
        totalPatients: metricsRes.data.total_patients,
        totalTests: metricsRes.data.total_tests,
        completedTests: metricsRes.data.completed_tests,
        completionRate: parseFloat(
          metricsRes.data.completion_rate.replace('%', '')
        ),
        avgWaitTime: metricsRes.data.avg_wait_time_minutes,
        avgTestDuration: metricsRes.data.avg_test_duration_minutes,
        pendingTests: queueRes.data.total_pending,
        inProgressTests: queueRes.data.total_in_progress,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({title, value, icon, color, subtitle, onClick}) => (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {transform: 'translateY(-4px)', boxShadow: 4} : {},
      }}
      onClick={onClick}>
      <CardContent>
        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: 2,
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{fontWeight: 'bold', mb: 1}}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({title, description, icon, color, path}) => (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {transform: 'translateY(-4px)', boxShadow: 4},
      }}
      onClick={() => navigate(path)}>
      <CardContent sx={{textAlign: 'center', py: 3}}>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}>
          {icon}
        </Box>
        <Typography
          variant="h6"
          component="div"
          sx={{mb: 1, fontWeight: 'bold'}}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{mt: 4}}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{mt: 4}}>
      <Typography variant="h4" component="h1" sx={{mb: 4, fontWeight: 'bold'}}>
        Healthcare System Dashboard
      </Typography>

      <Grid container spacing={3} sx={{mb: 4}}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={metrics.totalPatients}
            icon={<PeopleIcon sx={{color: 'white'}} />}
            color="#3b82f6"
            subtitle="Registered patients"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tests"
            value={metrics.totalTests}
            icon={<AssessmentIcon sx={{color: 'white'}} />}
            color="#10b981"
            subtitle="Assigned tests"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={metrics.completedTests}
            icon={<CheckCircleIcon sx={{color: 'white'}} />}
            color="#059669"
            subtitle={`${metrics.completionRate}% completion rate`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Queue"
            value={metrics.pendingTests + metrics.inProgressTests}
            icon={<QueueIcon sx={{color: 'white'}} />}
            color="#f59e0b"
            subtitle="Pending + In Progress"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{mb: 4}}>
        <Grid item xs={12} md={6}>
          <Paper sx={{p: 3}}>
            <Typography variant="h6" sx={{mb: 2, fontWeight: 'bold'}}>
              Performance Metrics
            </Typography>
            <Box sx={{mb: 3}}>
              <Box
                sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                <Typography variant="body2">Completion Rate</Typography>
                <Typography variant="body2" sx={{fontWeight: 'bold'}}>
                  {metrics.completionRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics.completionRate}
                sx={{height: 8, borderRadius: 4}}
              />
            </Box>
            <Box sx={{mb: 3}}>
              <Box
                sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                <Typography variant="body2">Average Wait Time</Typography>
                <Typography variant="body2" sx={{fontWeight: 'bold'}}>
                  {metrics.avgWaitTime} min
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((metrics.avgWaitTime / 60) * 100, 100)}
                sx={{height: 8, borderRadius: 4}}
              />
            </Box>
            <Box>
              <Box
                sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                <Typography variant="body2">Average Test Duration</Typography>
                <Typography variant="body2" sx={{fontWeight: 'bold'}}>
                  {metrics.avgTestDuration} min
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((metrics.avgTestDuration / 120) * 100, 100)}
                sx={{height: 8, borderRadius: 4}}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{p: 3}}>
            <Typography variant="h6" sx={{mb: 2, fontWeight: 'bold'}}>
              System Status
            </Typography>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Typography variant="body2">Queue Status</Typography>
                <Chip
                  label={
                    metrics.pendingTests + metrics.inProgressTests > 0
                      ? 'Active'
                      : 'Empty'
                  }
                  color={
                    metrics.pendingTests + metrics.inProgressTests > 0
                      ? 'warning'
                      : 'success'
                  }
                  size="small"
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Typography variant="body2">System Health</Typography>
                <Chip label="Healthy" color="success" size="small" />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Typography variant="body2">Last Update</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{mb: 3, fontWeight: 'bold'}}>
        Quick Actions
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="Register Patient"
            description="Add new patient with automatic test assignment"
            icon={<PeopleIcon sx={{color: 'white'}} />}
            color="#3b82f6"
            path="/patient-registration"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="Manage Queue"
            description="Monitor and update test statuses"
            icon={<QueueIcon sx={{color: 'white'}} />}
            color="#10b981"
            path="/queue-management"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="View Reports"
            description="Generate comprehensive analytics and reports"
            icon={<TrendingUpIcon sx={{color: 'white'}} />}
            color="#f59e0b"
            path="/reports"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="Appointments"
            description="Manage patient appointments and room assignments"
            icon={<ScheduleIcon sx={{color: 'white'}} />}
            color="#8b5cf6"
            path="/appointment-portal"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
