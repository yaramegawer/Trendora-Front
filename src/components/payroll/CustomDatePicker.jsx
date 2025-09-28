import React, { useState, useEffect } from 'react';
import {
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Grid,
  Button
} from '@mui/material';
import {
  CalendarToday,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';

const CustomDatePicker = ({ 
  label, 
  value, 
  onChange, 
  error, 
  helperText, 
  fullWidth = true 
}) => {
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState(value || new Date());

  useEffect(() => {
    if (value) {
      setCurrentDate(value);
      setSelectedDate(value);
    }
  }, [value]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    onChange(date);
    setOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <>
      <TextField
        fullWidth={fullWidth}
        label={label}
        value={formatDisplayDate(selectedDate)}
        onClick={() => setOpen(true)}
        error={!!error}
        helperText={helperText}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <IconButton
              onClick={() => setOpen(true)}
              edge="end"
              size="small"
            >
              <CalendarToday />
            </IconButton>
          )
        }}
        sx={{
          '& .MuiInputBase-input': {
            cursor: 'pointer'
          }
        }}
      />

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Select Date
            </Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              ×
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <IconButton onClick={handlePrevMonth} size="small">
                <ChevronLeft />
              </IconButton>
              
              <Typography variant="h6">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Typography>
              
              <IconButton onClick={handleNextMonth} size="small">
                <ChevronRight />
              </IconButton>
            </Box>

            {/* Day headers */}
            <Grid container spacing={0} sx={{ mb: 1 }}>
              {dayNames.map((day) => (
                <Grid item xs={12/7} key={day}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold', 
                      textAlign: 'center',
                      py: 1,
                      color: 'text.secondary'
                    }}
                  >
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar days */}
            <Grid container spacing={0}>
              {days.map((day, index) => (
                <Grid item xs={12/7} key={index}>
                  {day ? (
                    <Button
                      variant={isSelected(day) ? "contained" : "text"}
                      onClick={() => handleDateSelect(day)}
                      sx={{
                        minWidth: 'auto',
                        width: '100%',
                        height: 40,
                        borderRadius: 0,
                        color: isSelected(day) ? 'white' : 
                               isToday(day) ? 'primary.main' : 'text.primary',
                        backgroundColor: isSelected(day) ? 'primary.main' : 
                                        isToday(day) ? 'primary.light' : 'transparent',
                        fontWeight: isToday(day) ? 'bold' : 'normal',
                        '&:hover': {
                          backgroundColor: isSelected(day) ? 'primary.dark' : 'action.hover'
                        }
                      }}
                    >
                      {day.getDate()}
                    </Button>
                  ) : (
                    <Box sx={{ height: 40 }} />
                  )}
                </Grid>
              ))}
            </Grid>

            {/* Quick actions */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDateSelect(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomDatePicker;
