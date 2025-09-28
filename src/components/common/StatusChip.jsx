import React from 'react';
import { Chip } from '@mui/material';

const StatusChip = ({ status, type = 'default' }) => {
  const getStatusConfig = (status, type) => {
    const configs = {
      employee: {
        active: { color: 'success', label: 'Active' },
        inactive: { color: 'error', label: 'Inactive' }
      },
      leave: {
        pending: { color: 'warning', label: 'Pending' },
        approved: { color: 'success', label: 'Approved' },
        rejected: { color: 'error', label: 'Rejected' }
      },
      payroll: {
        pending: { color: 'warning', label: 'Pending' },
        paid: { color: 'success', label: 'Paid' },
        cancelled: { color: 'error', label: 'Cancelled' }
      },
      default: {
        [status]: { color: 'default', label: status }
      }
    };

    return configs[type]?.[status] || configs.default[status] || { color: 'default', label: status };
  };

  const config = getStatusConfig(status, type);

  return (
    <Chip
      label={config.label}
      color={config.color}
      variant="filled"
      size="small"
      className="font-medium"
    />
  );
};

export default StatusChip;