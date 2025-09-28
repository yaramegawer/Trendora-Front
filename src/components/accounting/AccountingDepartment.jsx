import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Stack, Avatar, Chip, Button } from '@mui/material';
import { AccountBalance, TrendingUp, AttachMoney, Assessment } from '@mui/icons-material';

const AccountingDepartment = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'grey.50',
      p: 3,
      fontSize: '13px'
    }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Accounting Department
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Financial management and accounting operations
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AttachMoney />} sx={{ borderRadius: 2 }}>
          New Transaction
        </Button>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    $125,430
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    $89,210
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Expenses
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    $36,220
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Net Profit
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <AccountBalance />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    $245,890
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cash Balance
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AttachMoney />}
                sx={{ py: 2, borderRadius: 2 }}
              >
                Record Payment
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<TrendingUp />}
                sx={{ py: 2, borderRadius: 2 }}
              >
                Generate Invoice
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Assessment />}
                sx={{ py: 2, borderRadius: 2 }}
              >
                View Reports
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AccountBalance />}
                sx={{ py: 2, borderRadius: 2 }}
              >
                Bank Reconciliation
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Recent Transactions
          </Typography>
          <Stack spacing={2}>
            {[
              { id: 1, description: 'Office Supplies Purchase', amount: '$1,250', type: 'expense', date: '2024-01-15' },
              { id: 2, description: 'Client Payment - Project Alpha', amount: '$5,000', type: 'income', date: '2024-01-14' },
              { id: 3, description: 'Software License Renewal', amount: '$2,400', type: 'expense', date: '2024-01-13' },
              { id: 4, description: 'Consulting Services', amount: '$3,200', type: 'income', date: '2024-01-12' },
            ].map((transaction) => (
              <Box
                key={transaction.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {transaction.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {transaction.date}
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: transaction.type === 'income' ? 'success.main' : 'error.main'
                    }}
                  >
                    {transaction.amount}
                  </Typography>
                  <Chip
                    label={transaction.type}
                    color={transaction.type === 'income' ? 'success' : 'error'}
                    size="small"
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccountingDepartment;
