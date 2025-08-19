import React, {useState, useEffect} from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Queue as QueueIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import axios from 'axios';

const QueueManagement = () => {
  const [queueData, setQueueData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [updateDialog, setUpdateDialog] = useState({
    open: false,
    patientTest: null,
  });
  const [updateData, setUpdateData] = useState({
    status: '',
    room_id: '',
    notes: '',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchInitialData();
    if (autoRefresh) {
      const interval = setInterval(fetchQueueData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedDepartment]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [deptRes, roomsRes] = await Promise.all([
        axios.get('https://mhcqms.onrender.com/queue/departments', {
          headers: {Authorization: `Bearer ${token}`},
        }),
        axios.get('https://mhcqms.onrender.com/queue/rooms', {
          headers: {Authorization: `Bearer ${token}`},
        }),
      ]);

      setDepartments(deptRes.data);
      setRooms(roomsRes.data);
      await fetchQueueData();
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchQueueData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://mhcqms.onrender.com/queue/status',
        {
          headers: {Authorization: `Bearer ${token}`},
          params: {department_id: selectedDepartment || undefined},
        }
      );
      setQueueData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching queue data:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'https://mhcqms.onrender.com/queue/update-status',
        {
          patient_test_id: updateDialog.patientTest.id,
          status: updateData.status,
          room_id:
            updateData.room_id && updateData.room_id !== ''
              ? updateData.room_id
              : null,
          notes: updateData.notes,
        },
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );

      setUpdateDialog({open: false, patientTest: null});
      setUpdateData({status: '', room_id: '', notes: ''});
      fetchQueueData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openUpdateDialog = (patientTest) => {
    setUpdateDialog({open: true, patientTest});
    setUpdateData({
      status: patientTest.status,
      room_id: patientTest.room_number
        ? rooms.find((r) => r.room_number === patientTest.room_number)?.id
        : '',
      notes: '',
    });
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
        return <QueueIcon />;
      case 'in_progress':
        return <PlayIcon />;
      case 'completed':
        return <CheckIcon />;
      default:
        return <QueueIcon />;
    }
  };

  const filteredQueueData = selectedDepartment
    ? queueData.filter(
        (item) =>
          item.department ===
          departments.find((d) => d.id === selectedDepartment)?.name
      )
    : queueData;

  return (
    <Container maxWidth="lg" sx={{mt: 4}}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}>
        <Typography variant="h4" component="h1" sx={{fontWeight: 'bold'}}>
          Queue Management
        </Typography>
        <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
          <FormControl size="small" sx={{minWidth: 200}}>
            <InputLabel>Filter by Department</InputLabel>
            <Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              label="Filter by Department">
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchQueueData}
            disabled={loading}>
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{p: 3}}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}>
              <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                Patient Queue ({filteredQueueData.length})
              </Typography>
              <Chip
                icon={<FilterIcon />}
                label={
                  selectedDepartment
                    ? departments.find((d) => d.id === selectedDepartment)?.name
                    : 'All Departments'
                }
                color="primary"
                variant="outlined"
              />
            </Box>

            {loading ? (
              <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                <CircularProgress />
              </Box>
            ) : filteredQueueData.length === 0 ? (
              <Box sx={{textAlign: 'center', py: 4}}>
                <Typography variant="body1" color="text.secondary">
                  No patients in queue
                </Typography>
              </Box>
            ) : (
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                {filteredQueueData.map((item, index) => (
                  <Card
                    key={index}
                    sx={{border: '1px solid', borderColor: 'divider'}}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}>
                        <Box sx={{flex: 1}}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              mb: 1,
                            }}>
                            <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                              {item.patient_name}
                            </Typography>
                            <Chip
                              icon={getStatusIcon(item.status)}
                              label={item.status
                                .replace('_', ' ')
                                .toUpperCase()}
                              color={getStatusColor(item.status)}
                              size="small"
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{mb: 1}}>
                            <strong>UHID:</strong> {item.unique_id} | Test:{' '}
                            {item.test_name} | Department: {item.department}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 2,
                              alignItems: 'center',
                            }}>
                            {item.room_number && (
                              <Chip
                                label={`Room: ${item.room_number}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {item.wait_time && (
                              <Chip
                                label={`Wait: ${item.wait_time} min`}
                                size="small"
                                variant="outlined"
                                color="warning"
                              />
                            )}
                            <Typography
                              variant="caption"
                              color="text.secondary">
                              Added:{' '}
                              {new Date(item.created_at).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{display: 'flex', gap: 1}}>
                          <Tooltip title="Update Status">
                            <IconButton
                              size="small"
                              onClick={() => openUpdateDialog(item)}
                              color="primary">
                              <AssignmentIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{p: 3, mb: 3}}>
            <Typography variant="h6" sx={{mb: 2, fontWeight: 'bold'}}>
              Queue Summary
            </Typography>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
              <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Typography variant="body2">Total in Queue:</Typography>
                <Typography variant="body2" sx={{fontWeight: 'bold'}}>
                  {filteredQueueData.length}
                </Typography>
              </Box>
              <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Typography variant="body2">Pending:</Typography>
                <Typography variant="body2" sx={{fontWeight: 'bold'}}>
                  {
                    filteredQueueData.filter(
                      (item) => item.status === 'pending'
                    ).length
                  }
                </Typography>
              </Box>
              <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Typography variant="body2">In Progress:</Typography>
                <Typography variant="body2" sx={{fontWeight: 'bold'}}>
                  {
                    filteredQueueData.filter(
                      (item) => item.status === 'in_progress'
                    ).length
                  }
                </Typography>
              </Box>
              <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Typography variant="body2">Completed:</Typography>
                <Typography variant="body2" sx={{fontWeight: 'bold'}}>
                  {
                    filteredQueueData.filter(
                      (item) => item.status === 'completed'
                    ).length
                  }
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{p: 3}}>
            <Typography variant="h6" sx={{mb: 2, fontWeight: 'bold'}}>
              Available Rooms
            </Typography>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
              {rooms
                .filter((room) => room.is_available)
                .map((room) => (
                  <Chip
                    key={room.id}
                    label={`${room.room_number} (${room.department?.name})`}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                ))}
              {rooms.filter((room) => room.is_available).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No rooms available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={updateDialog.open}
        onClose={() => setUpdateDialog({open: false, patientTest: null})}>
        <DialogTitle>Update Test Status</DialogTitle>
        <DialogContent>
          <Box sx={{pt: 1}}>
            <FormControl fullWidth sx={{mb: 2}}>
              <InputLabel>Status</InputLabel>
              <Select
                value={updateData.status}
                onChange={(e) =>
                  setUpdateData((prev) => ({...prev, status: e.target.value}))
                }
                label="Status">
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            {updateData.status === 'in_progress' && (
              <FormControl fullWidth sx={{mb: 2}}>
                <InputLabel>Assign Room</InputLabel>
                <Select
                  value={updateData.room_id}
                  onChange={(e) =>
                    setUpdateData((prev) => ({
                      ...prev,
                      room_id: e.target.value,
                    }))
                  }
                  label="Assign Room">
                  {rooms
                    .filter((room) => room.is_available)
                    .map((room) => (
                      <MenuItem key={room.id} value={room.id}>
                        {room.room_number} ({room.department?.name})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={updateData.notes}
              onChange={(e) =>
                setUpdateData((prev) => ({...prev, notes: e.target.value}))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setUpdateDialog({open: false, patientTest: null})}>
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QueueManagement;
