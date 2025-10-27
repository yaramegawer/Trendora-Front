import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Delete, CheckCircle, Cancel, Edit, Search as SearchIcon } from '@mui/icons-material';
import hrAdvancesApi from '../../services/hrAdvancesApi';
import SimplePagination from '../common/SimplePagination';

const statusColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'approved' || s === 'paid') return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'rejected') return 'error';
  return 'default';
};

const formatDate = (d) => {
  if (!d) return 'N/A';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString();
  } catch {
    return 'N/A';
  }
};

const getEmpName = (adv) => {
  const emp = adv?.employee;
  if (!emp) return 'Unknown';
  return `${emp.firstName || emp.first_name || ''} ${emp.lastName || emp.last_name || ''}`.trim() || 'Unknown';
};

const AdvancesManagement = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [success, setSuccess] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [localSearchTerm, setLocalSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState('createdAt');
  const [sortOrder, setSortOrder] = React.useState('desc');
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [editStatus, setEditStatus] = React.useState('pending');

  const load = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await hrAdvancesApi.getAdvances(p, 10, { status });
      if (res && res.success && Array.isArray(res.data)) {
        setItems(res.data);
        setTotal(
          (typeof res.totalAdvances === 'number') ? res.totalAdvances :
          (typeof res.total === 'number') ? res.total :
          (typeof res.count === 'number') ? res.count :
          (typeof res.totalCount === 'number') ? res.totalCount :
          res.data.length
        );
        if (typeof res.page === 'number') setPage(res.page);
        if (typeof res.limit === 'number') setPageSize(res.limit);
        if (typeof res.totalPages === 'number') setTotalPages(res.totalPages);
      } else if (res && Array.isArray(res.advances)) {
        setItems(res.advances);
        setTotal(
          (typeof res.totalAdvances === 'number') ? res.totalAdvances :
          (typeof res.total === 'number') ? res.total :
          (typeof res.count === 'number') ? res.count :
          (typeof res.totalCount === 'number') ? res.totalCount :
          res.advances.length
        );
        if (typeof res.page === 'number') setPage(res.page);
        if (typeof res.limit === 'number') setPageSize(res.limit);
        if (typeof res.totalPages === 'number') setTotalPages(res.totalPages);
      } else if (res && res.data && Array.isArray(res.data.advances)) {
        setItems(res.data.advances);
        setTotal(
          (typeof res.data.totalAdvances === 'number') ? res.data.totalAdvances :
          (typeof res.totalAdvances === 'number') ? res.totalAdvances :
          (typeof res.total === 'number') ? res.total :
          (typeof res.count === 'number') ? res.count :
          (typeof res.totalCount === 'number') ? res.totalCount :
          res.data.advances.length
        );
        if (typeof res.data.page === 'number') setPage(res.data.page);
        if (typeof res.data.limit === 'number') setPageSize(res.data.limit);
        if (typeof res.data.totalPages === 'number') setTotalPages(res.data.totalPages);
      } else if (Array.isArray(res)) {
        setItems(res);
        setTotal(res.length);
      } else {
        setItems([]);
        setTotal(0);
      }
      // fallback if server didn't provide page/limit/totalPages
      if (typeof res?.page !== 'number' && typeof res?.data?.page !== 'number') setPage(p);
      if (typeof res?.limit !== 'number' && typeof res?.data?.limit !== 'number') setPageSize(10);
      if (typeof res?.totalPages !== 'number' && typeof res?.data?.totalPages !== 'number') {
        setTotalPages(Math.max(1, Math.ceil(((typeof res?.totalAdvances === 'number') ? res.totalAdvances : total) / pageSize)));
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to fetch advances';
      setError(msg);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const getItemsFromResponse = (res) => {
    if (res && res.success && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.advances)) return res.advances;
    if (res && res.data && Array.isArray(res.data.advances)) return res.data.advances;
    if (Array.isArray(res)) return res;
    return [];
  };

  const getTotalFromResponse = (res) => {
    if (!res) return 0;
    if (typeof res?.totalAdvances === 'number') return res.totalAdvances;
    if (typeof res?.total === 'number') return res.total;
    if (typeof res?.count === 'number') return res.count;
    if (typeof res?.totalCount === 'number') return res.totalCount;
    if (typeof res?.data?.totalAdvances === 'number') return res.data.totalAdvances;
    return getItemsFromResponse(res).length;
  };

  const loadAllForSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const first = await hrAdvancesApi.getAdvances(1, 10, { status });
      const firstItems = getItemsFromResponse(first);
      const limit = typeof first?.limit === 'number' ? first.limit : (typeof first?.data?.limit === 'number' ? first.data.limit : 10);
      const totalCount = getTotalFromResponse(first);
      const tPages = typeof first?.totalPages === 'number' ? first.totalPages : (typeof first?.data?.totalPages === 'number' ? first.data.totalPages : Math.max(1, Math.ceil(totalCount / limit)));
      const promises = [];
      for (let p = 2; p <= tPages; p++) {
        promises.push(hrAdvancesApi.getAdvances(p, limit, { status }));
      }
      const rest = await Promise.all(promises);
      let all = [...firstItems];
      rest.forEach((r) => {
        all = all.concat(getItemsFromResponse(r));
      });
      setItems(all);
      setTotal(all.length);
      setPageSize(limit);
      setTotalPages(Math.max(1, Math.ceil(all.length / limit)));
      setPage(1);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to fetch advances';
      setError(msg);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (localSearchTerm.trim()) {
      loadAllForSearch();
    } else {
      load(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, localSearchTerm]);

  const handleUpdate = async (adv, newStatus) => {
    try {
      setError('');
      setSuccess('');
      await hrAdvancesApi.updateStatus(adv._id || adv.id, newStatus);
      setSuccess(`Advance ${newStatus} successfully`);
      await load(page);
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError(e.message || 'Failed to update advance');
    }
  };

  const handleDelete = async (adv) => {
    if (!window.confirm('Delete this advance?')) return;
    try {
      setError('');
      setSuccess('');
      const hadOneItem = items.length === 1;
      await hrAdvancesApi.deleteAdvance(adv._id || adv.id);
      setSuccess('Advance deleted successfully');
      await load(page);
      if (hadOneItem && page > 1) {
        await load(page - 1);
      }
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError(e.message || 'Failed to delete advance');
    }
  };

  const handleEditClick = (adv) => {
    setEditing(adv);
    // Normalize to lowercase for consistency
    setEditStatus(String(adv.status || 'pending').toLowerCase());
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    try {
      setError('');
      setSuccess('');
      // Convert to lowercase for backend
      const statusToSend = String(editStatus).toLowerCase();
      await hrAdvancesApi.updateStatus(editing._id || editing.id, statusToSend);
      setSuccess(`Advance status updated to "${editStatus}" successfully!`);
      setEditOpen(false);
      setEditing(null);
      await load(page);
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError(e.message || 'Failed to update advance');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Advances Management
          </Typography>

          {/* Filters */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Search (searches all pages)"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder="Search by employee name, email, month, status or amount..."
                InputProps={{ startAdornment: <SearchIcon /> }}
                helperText={''}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status Filter</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Payroll Month</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Requested At</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(localSearchTerm.trim() ? items.filter((adv) => {
                      const term = localSearchTerm.trim().toLowerCase();
                      const name = getEmpName(adv).toLowerCase();
                      const email = (adv?.employee?.email || '').toLowerCase();
                      const month = String(adv?.payrollMonth || '').toLowerCase();
                      const statusText = String(adv?.status || '').toLowerCase();
                      const amount = String(adv?.amount || '').toLowerCase();
                      return (
                        name.includes(term) ||
                        email.includes(term) ||
                        month.includes(term) ||
                        statusText.includes(term) ||
                        amount.includes(term)
                      );
                    }).slice((page - 1) * pageSize, page * pageSize) : items).map((adv, idx) => (
                      <TableRow key={adv._id || adv.id || idx} hover>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar>{getEmpName(adv).charAt(0)}</Avatar>
                            <Box>
                              <Typography variant="subtitle2">{getEmpName(adv)}</Typography>
                              <Typography variant="caption" color="text.secondary">{adv?.employee?.email || ''}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>EGP {Number(adv.amount || 0).toLocaleString()}</TableCell>
                        <TableCell>{adv.payrollMonth || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip size="small" label={adv.status || 'pending'} color={statusColor(adv.status)} sx={{ textTransform: 'capitalize' }} />
                        </TableCell>
                        <TableCell>{formatDate(adv.requestDate || adv.createdAt)}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton
                              onClick={() => handleEditClick(adv)}
                              title="Update Status"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDelete(adv)}>
                              <Delete />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {total > 0 && (
                <SimplePagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={total}
                  pageSize={pageSize}
                  onPageChange={(p) => (localSearchTerm.trim() ? setPage(p) : load(p))}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Advance Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={() => { setEditOpen(false); setEditing(null); }} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Update Advance Status</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Employee: {editing && getEmpName(editing)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Amount: EGP {Number(editing?.amount || 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Payroll Month: {editing?.payrollMonth || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Status: {editing?.status || 'pending'}
            </Typography>

            <FormControl fullWidth>
              <InputLabel id="edit-status-label">New Status</InputLabel>
              <Select
                labelId="edit-status-label"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                label="New Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditOpen(false); setEditing(null); }}>Cancel</Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained"
            disabled={!editStatus || String(editStatus).toLowerCase() === String(editing?.status || '').toLowerCase()}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancesManagement;
