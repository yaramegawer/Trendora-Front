import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { accountingApi } from '../../services/accountingApi';

const InvoiceApiTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testGetInvoice = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test with a sample invoice ID - you can replace this with an actual ID
      const testInvoiceId = '507f1f77bcf86cd799439011'; // Sample MongoDB ObjectId
      const response = await accountingApi.getInvoice(testInvoiceId);
      
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testGetAllInvoices = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await accountingApi.getAllInvoices(1, 5);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Invoice API Test
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={testGetAllInvoices}
          disabled={loading}
        >
          Test Get All Invoices
        </Button>
        <Button 
          variant="outlined" 
          onClick={testGetInvoice}
          disabled={loading}
        >
          Test Get Single Invoice
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Testing API...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      {result && (
        <Box>
          <Typography variant="h6" gutterBottom>
            API Response:
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              bgcolor: 'grey.100', 
              p: 2, 
              borderRadius: 1, 
              overflow: 'auto',
              fontSize: '12px'
            }}
          >
            {JSON.stringify(result, null, 2)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default InvoiceApiTest;
