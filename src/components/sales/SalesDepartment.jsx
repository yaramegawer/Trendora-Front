import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const SalesDepartment = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'grey.50',
      p: 3,
      fontSize: '13px'
    }}>
      <Paper 
        elevation={2}
        sx={{ 
          p: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1c242e 0%, #334155 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
          Sales Department
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
          Coming Soon
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
          The Sales Department module is currently under development. 
          This section will include sales analytics, lead management, 
          customer relationship tools, and performance tracking.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SalesDepartment;
