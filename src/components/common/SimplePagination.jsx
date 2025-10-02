import React from 'react';
import { Box, Button, Typography, Stack, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, FirstPage, LastPage } from '@mui/icons-material';

const SimplePagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  totalItems = 0,
  pageSize = 10,
  onPageChange 
}) => {

  // Generate all page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '16px 24px',
      backgroundColor: 'transparent',
      margin: '16px auto',
      maxWidth: '800px',
      flexWrap: 'wrap',
      gap: '8px'
    }}>
      {/* First Page Button */}
      <IconButton
        onClick={() => onPageChange(1)}
        disabled={currentPage <= 1}
        sx={{
          color: currentPage === 1 ? '#1c242e' : '#6b7280',
          '&:hover': {
            backgroundColor: '#f3f4f6'
          },
          '&:disabled': {
            color: '#d1d5db'
          }
        }}
      >
        <FirstPage />
      </IconButton>

      {/* Previous Button */}
      <Button
        variant="outlined"
        startIcon={<ChevronLeft />}
        onClick={() => {
          console.log(`🔍 SimplePagination: Previous button clicked`);
          console.log(`🔍 - currentPage: ${currentPage}, going to: ${currentPage - 1}`);
          onPageChange(currentPage - 1);
        }}
        disabled={currentPage <= 1}
        sx={{
          minWidth: '80px',
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
        Prev
      </Button>
      
      {/* Page Numbers */}
      <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
        {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'contained' : 'outlined'}
                onClick={() => {
                  console.log(`🔍 SimplePagination: Page ${page} clicked`);
                  console.log(`🔍 - currentPage: ${currentPage}`);
                  console.log(`🔍 - totalPages: ${totalPages}`);
                  onPageChange(page);
                }}
                sx={{
              minWidth: '40px',
              height: '40px',
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: currentPage === page ? 'bold' : 'medium',
              backgroundColor: currentPage === page ? '#1c242e' : 'transparent',
              color: currentPage === page ? 'white' : '#374151',
              borderColor: currentPage === page ? '#1c242e' : '#d1d5db',
              '&:hover': {
                backgroundColor: currentPage === page ? '#1c242e' : '#f3f4f6',
                borderColor: currentPage === page ? '#1c242e' : '#1c242e'
              }
            }}
          >
            {page}
          </Button>
        ))}
      </Box>
      
      {/* Next Button */}
      <Button
        variant="outlined"
        endIcon={<ChevronRight />}
        onClick={() => {
          console.log(`🔍 SimplePagination: Next button clicked`);
          console.log(`🔍 - currentPage: ${currentPage}, going to: ${currentPage + 1}`);
          onPageChange(currentPage + 1);
        }}
        disabled={currentPage >= totalPages}
        sx={{
          minWidth: '80px',
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

      {/* Last Page Button */}
      <IconButton
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage >= totalPages}
        sx={{
          color: currentPage === totalPages ? '#1c242e' : '#6b7280',
          '&:hover': {
            backgroundColor: '#f3f4f6'
          },
          '&:disabled': {
            color: '#d1d5db'
          }
        }}
      >
        <LastPage />
      </IconButton>

    </Box>
  );
};

export default SimplePagination;
