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

  // Calculate total pages from totalItems if totalPages is not provided or is 1
  const calculatedTotalPages = totalPages > 1 ? totalPages : Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Generate all page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show all pages
    for (let i = 1; i <= calculatedTotalPages; i++) {
      pages.push(i);
    }
    
    console.log('📄 Generated page numbers:', pages, 'for total pages:', calculatedTotalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Debug logging
  console.log('🔍 SimplePagination Debug:', {
    currentPage,
    totalPages,
    calculatedTotalPages,
    totalItems,
    pageSize,
    pageNumbersLength: pageNumbers.length
  });

  // Show pagination even with 1 page for debugging/testing
  // In production, you might want to hide it with: if (calculatedTotalPages <= 1) return null;
  if (calculatedTotalPages <= 0 || totalItems <= 0) {
    console.log('🚫 Not rendering pagination - no items', {
      calculatedTotalPages,
      totalItems,
      pageSize
    });
    return null;
  }

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
        onClick={() => onPageChange(currentPage - 1)}
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
                onClick={() => onPageChange(page)}
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
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= calculatedTotalPages}
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
        onClick={() => onPageChange(calculatedTotalPages)}
        disabled={currentPage >= calculatedTotalPages}
        sx={{
          color: currentPage === calculatedTotalPages ? '#1c242e' : '#6b7280',
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

      {/* Info Text */}
      <Typography sx={{ 
        ml: 2, 
        fontSize: '14px', 
        color: '#6b7280',
        whiteSpace: 'nowrap'
      }}>
        {totalItems} {totalItems === 1 ? 'item' : 'items'} total
      </Typography>

    </Box>
  );
};

export default SimplePagination;
