import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const Reports = () => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [departmentEfficiency, setDepartmentEfficiency] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [deptRes, metricsRes, efficiencyRes] = await Promise.all([
        axios.get('http://localhost:8000/api/queue/departments', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/reports/performance-metrics', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/reports/department-efficiency', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setDepartments(deptRes.data);
      setPerformanceMetrics(metricsRes.data);
      setDepartmentEfficiency(efficiencyRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/reports/patient-completion', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          department_id: selectedDepartment || undefined
        }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/reports/export', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        department_id: selectedDepartment || null,
        format: format
      }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${format}_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const getDailySummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/reports/daily-summary', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: new Date().toISOString().split('T')[0] }
      });
      setDailySummary(response.data);
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    }
  };

  useEffect(() => {
    getDailySummary();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
        Reports & Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Generate Custom Report
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department (Optional)</InputLabel>
                  <Select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    label="Department (Optional)"
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', gap: 2, height: '100%', alignItems: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={generateReport}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <AssessmentIcon />}
                    sx={{ flex: 1 }}
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {reportData && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Report Results ({reportData.length} records)</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => exportReport('pdf')}
                    >
                      PDF
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => exportReport('csv')}
                    >
                      CSV
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => exportReport('excel')}
                    >
                      Excel
                    </Button>
                  </Box>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Test</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Room</TableCell>
                        <TableCell>Wait Time</TableCell>
                        <TableCell>Test Duration</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.slice(0, 10).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row['Patient ID']}</TableCell>
                          <TableCell>{row['Patient Name']}</TableCell>
                          <TableCell>{row['Test']}</TableCell>
                          <TableCell>{row['Department']}</TableCell>
                          <TableCell>
                            <Chip
                              label={row['Status']}
                              size="small"
                              color={row['Status'] === 'completed' ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>{row['Room']}</TableCell>
                          <TableCell>{row['Wait Time (min)']}</TableCell>
                          <TableCell>{row['Test Duration (min)']}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {reportData.length > 10 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    Showing first 10 records. Export to see all {reportData.length} records.
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Performance Overview
            </Typography>
            {performanceMetrics ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Completion Rate</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {performanceMetrics.completion_rate}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(performanceMetrics.completion_rate.replace('%', ''))}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Avg Wait Time</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {performanceMetrics.avg_wait_time_minutes} min
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((performanceMetrics.avg_wait_time_minutes / 60) * 100, 100)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Avg Test Duration</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {performanceMetrics.avg_test_duration_minutes} min
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((performanceMetrics.avg_test_duration_minutes / 120) * 100, 100)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Box>
            ) : (
              <CircularProgress size={24} />
            )}
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Today's Summary
            </Typography>
            {dailySummary ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Registrations:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {dailySummary.total_registrations}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Tests:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {dailySummary.total_tests}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Completed:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {dailySummary.completed_tests}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Completion Rate:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {dailySummary.completion_rate}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <CircularProgress size={24} />
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Department Efficiency Analysis
        </Typography>
        <Grid container spacing={3}>
          {departmentEfficiency.map((dept, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {dept.Department}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Total Tests:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {dept['Total Tests']}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Completed:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {dept['Completed Tests']}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Completion Rate:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {dept['Completion Rate']}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Avg Wait Time:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {dept['Avg Wait Time (min)']}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Avg Duration:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {dept['Avg Test Duration (min)']}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default Reports;
