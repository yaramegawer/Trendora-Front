import React from 'react';
import { Card, Typography, Stack } from '@mui/material';
// Utility function for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const StatsCard = ({ title, value, icon: IconComponent, color = 'primary', trend }) => {
  const formatValue = (val) => {
    if (title.toLowerCase().includes('payroll')) {
      return formatCurrency(val);
    }
    return val.toLocaleString();
  };

  return (
    <Card 
      elevation={2}
      sx={{ 
        p: 3, 
        '&:hover': { 
          boxShadow: 6 
        },
        transition: 'box-shadow 0.2s ease-in-out'
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }} color={`${color}.main`}>
              {formatValue(value)}
            </Typography>
          </Stack>
          
          {IconComponent && (
            <Stack 
              sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: `${color}.50`
              }}
            >
              <IconComponent 
                sx={{ color: `${color}.600` }}
                fontSize="medium"
              />
            </Stack>
          )}
        </Stack>

        {trend && (
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 500,
                color: trend.direction === 'up' ? 'success.main' : 'error.main'
              }}
            >
              {trend.direction === 'up' ? '↗' : '↘'} {trend.percentage}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              from last month
            </Typography>
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

export default StatsCard;