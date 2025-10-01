import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const SimplePagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  totalItems = 0,
  pageSize = 10,
  onPageChange 
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '16px 24px',
      backgroundColor: 'transparent',
      margin: '16px auto',
      maxWidth: '600px'
    }}>
      {/* Pagination controls */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="outlined"
          startIcon={<ChevronLeft />}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          sx={{
            minWidth: '100px',
            textTransform: 'none',
            borderColor: '#d1d5db',
            color: '#374151',
            '&:hover': {
              borderColor: '#1c242e',
              backgroundColor: '#f9fafb'
            },
            '&:disabled': {
              borderColor: '#e5e7eb',
              color: '#9ca3af'
            }
          }}
        >
          Previous
        </Button>
        
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: 'transparent',
          minWidth: '140px',
          justifyContent: 'center'
        }}>
          <Typography variant="body2" fontWeight="medium" color="text.primary">
            Page {currentPage} of {totalPages}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {startItem}-{endItem} of {totalItems}
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          endIcon={<ChevronRight />}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          sx={{
            minWidth: '100px',
            textTransform: 'none',
            borderColor: '#d1d5db',
            color: '#374151',
            '&:hover': {
              borderColor: '#1c242e',
              backgroundColor: '#f9fafb'
            },
            '&:disabled': {
              borderColor: '#e5e7eb',
              color: '#9ca3af'
            }
          }}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
};

export default SimplePagination;
