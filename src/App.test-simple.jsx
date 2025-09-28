import React from 'react';
import { Box, Typography } from '@mui/material';

const TestApp = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Test App</Typography>
      <Typography variant="body1">If you can see this, React is working!</Typography>
    </Box>
  );
};

export default TestApp;
