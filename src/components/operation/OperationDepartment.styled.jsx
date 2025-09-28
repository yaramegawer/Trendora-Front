import React, { useState } from 'react';
import { 
  Users, 
  Megaphone, 
  Plus, 
  Star, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3,
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  Zap,
  Award,
  Briefcase,
  Globe,
  PieChart,
  Activity,
  Shield,
  Code,
  Monitor,
  Database,
  Cloud,
  Wifi,
  Server,
  CheckCircle
} from 'lucide-react';
import { useOperationEmployees, useOperationCampaigns, useOperationLeaves } from '../../hooks/useOperationData';
import { operationTicketApi } from '../../services/operationApi';
import { useAuth } from '../../contexts/AuthContext';
import { canSubmitLeave, canCreateCampaigns, showPermissionError } from '../../utils/permissions';

const OperationDepartment = () => {
  // Use real API data
  const { employees, loading: employeesLoading, error: employeesError, updateEmployeeRating, fetchEmployees } = useOperationEmployees();
  const { campaigns, loading: campaignsLoading, error: campaignsError, createCampaign, updateCampaign, deleteCampaign } = useOperationCampaigns();
  const { addLeave } = useOperationLeaves();
  const { user } = useAuth();

  // State for forms
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // State for campaign editing
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [showEditCampaign, setShowEditCampaign] = useState(false);
  

  // State for employee ratings
  const [employeeRatings, setEmployeeRatings] = useState({});
  const [employeeNotes, setEmployeeNotes] = useState({});

  // State for new campaign form
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planned',
    notes: ''
  });


  // State for new ticket form
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  // State for operation leave form
  const [showCreateOperationLeave, setShowCreateOperationLeave] = useState(false);
  const [newOperationLeave, setNewOperationLeave] = useState({
    startDate: '',
    endDate: '',
    type: 'annual'
  });

  // View toggle: 'dashboard' | 'employees' | 'campaigns' | 'leaves'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Employee rating handlers
  const handleRatingChange = (employeeId, category, value) => {

    // Update local state only
    const currentRatings = employeeRatings[employeeId] || {};
    const updatedRatings = {
      ...currentRatings,
      [category]: parseInt(value)
    };
    
    setEmployeeRatings(prev => ({
      ...prev,
      [employeeId]: updatedRatings
    }));
  };

  const handleSubmitRating = async (employeeId) => {

    try {
      const currentRatings = employeeRatings[employeeId] || {};
      const currentNote = employeeNotes[employeeId] || '';
      
      // Send all ratings and note to backend
      const ratingData = {
        efficiency: currentRatings.efficiency || 1,
        performance: currentRatings.performance || 1,
        teamwork: currentRatings.teamwork || 1
      };
      
      // Only add note if it has content
      if (currentNote && currentNote.trim().length > 0) {
        ratingData.note = currentNote.trim();
      }
      
      console.log('Submitting rating for employee:', employeeId);
      console.log('Rating data:', ratingData);
      
      const result = await updateEmployeeRating(employeeId, ratingData);
      console.log('Update result:', result);
      
      // Check if the result indicates success (either result.success or result.message contains success)
      if (result.success || (result.message && result.message.toLowerCase().includes('success'))) {
        alert('Rating submitted successfully!');
        
        // Clear local state after successful submission
        setEmployeeRatings(prev => {
          const newState = { ...prev };
          delete newState[employeeId];
          return newState;
        });
        setEmployeeNotes(prev => {
          const newState = { ...prev };
          delete newState[employeeId];
          return newState;
        });
        
        // Force refresh of employee data to get updated ratings and notes
        setTimeout(() => {
          fetchEmployees();
        }, 500);
      } else {
        alert('Failed to submit rating: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Failed to submit rating: ' + error.message);
    }
  };

  const handleNoteChange = (employeeId, note) => {

    // Update local note state only
    setEmployeeNotes(prev => ({
      ...prev,
      [employeeId]: note
    }));
  };

  // Campaign handlers
  const handleCreateCampaign = async () => {
    if (!canCreateCampaigns(user)) {
      showPermissionError('create campaigns', user);
      return;
    }

    // Validate required fields
    if (!newCampaign.name || !newCampaign.startDate || !newCampaign.endDate) {
      alert('Please fill in all required fields (Name, Start Date, End Date)');
      return;
    }

    // Validate name length
    if (newCampaign.name.length < 3 || newCampaign.name.length > 50) {
      alert('Campaign name must be between 3 and 50 characters');
      return;
    }

    // Validate description length
    if (newCampaign.description && newCampaign.description.length > 500) {
      alert('Description must be 500 characters or less');
      return;
    }

    // Validate notes length
    if (newCampaign.notes && newCampaign.notes.length > 500) {
      alert('Notes must be 500 characters or less');
      return;
    }

    // Validate date range
    if (new Date(newCampaign.startDate) >= new Date(newCampaign.endDate)) {
      alert('End date must be after start date');
      return;
    }
    
    try {
      // Prepare data according to backend schema
      const campaignData = {
        name: newCampaign.name,
        startDate: newCampaign.startDate,
        endDate: newCampaign.endDate,
        status: newCampaign.status
      };

      // Only include optional fields if they have values
      if (newCampaign.description && newCampaign.description.trim()) {
        campaignData.description = newCampaign.description.trim();
      }
      if (newCampaign.notes && newCampaign.notes.trim()) {
        campaignData.notes = newCampaign.notes.trim();
      }

      const result = await createCampaign(campaignData);
      
      if (result.success) {
        alert('Campaign created successfully!');
      setNewCampaign({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
          status: 'planned',
          notes: ''
      });
      setShowCreateCampaign(false);
      } else {
        alert('Failed to create campaign: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign: ' + error.message);
    }
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setShowEditCampaign(true);
  };

  const handleUpdateCampaign = async () => {
    if (!editingCampaign) return;

    // Validate name length only if name is provided
    if (editingCampaign.name && (editingCampaign.name.length < 3 || editingCampaign.name.length > 50)) {
      alert('Campaign name must be between 3 and 50 characters');
      return;
    }

    // Validate description length only if description is provided
    if (editingCampaign.description && editingCampaign.description.length > 500) {
      alert('Description must be 500 characters or less');
      return;
    }

    // Validate notes length only if notes are provided
    if (editingCampaign.notes && editingCampaign.notes.length > 500) {
      alert('Notes must be 500 characters or less');
      return;
    }

    // Validate date range only if both dates are provided
    if (editingCampaign.startDate && editingCampaign.endDate && 
        new Date(editingCampaign.startDate) >= new Date(editingCampaign.endDate)) {
      alert('End date must be after start date');
      return;
    }

    try {
      // Prepare data according to backend schema - only include fields that have values
      const campaignData = {};

      // Only include fields that have values
      if (editingCampaign.name && editingCampaign.name.trim()) {
        campaignData.name = editingCampaign.name.trim();
      }
      if (editingCampaign.description && editingCampaign.description.trim()) {
        campaignData.description = editingCampaign.description.trim();
      }
      if (editingCampaign.startDate) {
        campaignData.startDate = editingCampaign.startDate;
      }
      if (editingCampaign.endDate) {
        campaignData.endDate = editingCampaign.endDate;
      }
      if (editingCampaign.status) {
        campaignData.status = editingCampaign.status;
      }
      if (editingCampaign.notes && editingCampaign.notes.trim()) {
        campaignData.notes = editingCampaign.notes.trim();
      }

      // Check if at least one field is being updated
      if (Object.keys(campaignData).length === 0) {
        alert('Please update at least one field');
        return;
      }

      const result = await updateCampaign(editingCampaign.id || editingCampaign._id, campaignData);
      
      if (result.success) {
        alert('Campaign updated successfully!');
        setShowEditCampaign(false);
        setEditingCampaign(null);
      } else {
        alert('Failed to update campaign: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign: ' + error.message);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {

    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(campaignId);
        alert('Campaign deleted successfully!');
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Failed to delete campaign: ' + error.message);
      }
    }
  };

  // Quick status update handler
  const handleQuickStatusUpdate = async (campaignId, newStatus) => {
    try {
      const result = await updateCampaign(campaignId, { status: newStatus });
      if (result.success) {
        // Status will be updated automatically due to fetchCampaigns() in the hook
        console.log('Campaign status updated successfully');
      } else {
        alert('Failed to update campaign status: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
      alert('Failed to update campaign status: ' + error.message);
    }
  };


  // Ticket handlers
  const handleCreateTicket = async () => {
    try {

      // Validate required fields
      if (!newTicket.title || !newTicket.description) {
        alert('Please fill in all required fields (Issue Type and Description)');
        return;
      }

      // Validate that a valid issue type is selected
      if (newTicket.title === '') {
        alert('Please select an issue type');
        return;
      }

      // Validate user ID exists
      if (!user || !user.id) {
        alert('User authentication error. Please log in again.');
        return;
      }

      // Validate description length
      if (newTicket.description.length < 10 || newTicket.description.length > 500) {
        alert('Description must be between 10 and 500 characters');
        return;
      }

      // Prepare data according to backend schema
      const ticketData = {
        title: newTicket.title.trim(),
        description: newTicket.description.trim(),
        priority: newTicket.priority
      };

      console.log('Creating ticket:', ticketData);
      const result = await operationTicketApi.addTicket(ticketData);
      
      if (result.success) {
        alert('Ticket created successfully!');
        setNewTicket({
          title: '',
          description: '',
          priority: 'medium'
        });
        setShowCreateTicket(false);
      } else {
        alert('Failed to create ticket: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket: ' + error.message);
    }
  };

  // Operation Leave handlers
  const handleCreateOperationLeave = async () => {
    try {
      if (!canSubmitLeave(user)) {
        alert('You must be logged in to submit leave requests');
        return;
      }

      if (!newOperationLeave.startDate || !newOperationLeave.endDate) {
        alert('Please fill in all required fields');
        return;
      }

      if (new Date(newOperationLeave.startDate) > new Date(newOperationLeave.endDate)) {
        alert('End date must be after start date');
        return;
      }

      const leaveData = {
        startDate: newOperationLeave.startDate,
        endDate: newOperationLeave.endDate,
        type: newOperationLeave.type
      };

      console.log('Creating operation leave:', leaveData);
      const result = await addLeave(leaveData);
      
      if (result.success) {
        alert('Operation leave request submitted successfully!');
        setNewOperationLeave({
          startDate: '',
          endDate: '',
          type: 'annual'
        });
        setShowCreateOperationLeave(false);
      } else {
        alert('Failed to submit leave request: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating operation leave:', error);
      alert('Failed to submit leave request: ' + error.message);
    }
  };

  // Utility functions
  const getOverallRating = (employee) => {
    const employeeId = employee.id || employee._id;
    const localRatings = employeeRatings[employeeId];
    
    // Check for ratings in different possible structures
    const efficiency = localRatings?.efficiency || 
                     employee.efficiency || 
                     employee.rating?.efficiency || 
                     1;
    const performance = localRatings?.performance || 
                      employee.performance || 
                      employee.rating?.performance || 
                      1;
    const teamwork = localRatings?.teamwork || 
                    employee.teamwork || 
                    employee.rating?.teamwork || 
                    1;
    
    return Math.round((efficiency + performance + teamwork) / 3);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#10b981';
    if (rating >= 3) return '#f59e0b';
    return '#ef4444';
  };

  const getCampaignStatus = (campaign) => {
    // Use the actual status from the database if available
    if (campaign.status) {
      switch (campaign.status.toLowerCase()) {
        case 'planned':
          return { text: 'Planned', color: '#3b82f6' };
        case 'active':
          return { text: 'Active', color: '#f59e0b' };
        case 'paused':
          return { text: 'Paused', color: '#ef4444' };
        case 'completed':
          return { text: 'Completed', color: '#10b981' };
        default:
          return { text: campaign.status, color: '#6b7280' };
      }
    }
    
    // Fallback to date-based calculation if no status in database
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    if (now < startDate) return { text: 'Scheduled', color: '#3b82f6' };
    if (now > endDate) return { text: 'Completed', color: '#10b981' };
    return { text: 'Active', color: '#f59e0b' };
  };


  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Spacing */}
        <div style={{ height: '24px' }}></div>

        {/* Navigation Tabs */}
        <div style={{ 
            backgroundColor: 'white',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          gap: '2px'
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'employees', label: 'Employees', icon: Users },
            { id: 'campaigns', label: 'Campaigns', icon: Megaphone }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: activeTab === tab.id ? '#1c242e' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flex: 1,
                justifyContent: 'center'
              }}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {/* Quick Actions */}
          <div style={{
            backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => setShowCreateCampaign(true)}
                  disabled={!canCreateCampaigns(user)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    backgroundColor: canCreateCampaigns(user) ? '#0891b2' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: canCreateCampaigns(user) ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
                    if (canCreateCampaigns(user)) {
                      e.target.style.backgroundColor = '#0e7490';
                    }
          }}
          onMouseOut={(e) => {
                    if (canCreateCampaigns(user)) {
                      e.target.style.backgroundColor = '#0891b2';
                    }
                  }}
                  title={canCreateCampaigns(user) ? "Create new campaign" : "Permission denied - Admin only"}
                >
                  <Plus size={14} />
                  Create Campaign
                </button>
                
                <button
                  onClick={() => setShowCreateTicket(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    backgroundColor: '#1c242e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#334155'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#1c242e'}
                >
                  <Plus size={14} />
                  Submit Ticket
                </button>
                
                <button
                  onClick={() => setShowCreateOperationLeave(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                >
                  <Calendar size={14} />
                  Submit Leave
                </button>
              </div>
            </div>

            {/* Employee Stats */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #f3f4f6',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>Total Employees</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {employeesLoading ? '...' : Array.isArray(employees) ? employees.length : 0}
                </p>
                  <p style={{ fontSize: '10px', color: '#10b981', margin: '4px 0 0 0' }}>+8% from last month</p>
              </div>
                <div style={{ padding: '12px', backgroundColor: '#f59e0b', borderRadius: '8px' }}>
                <Users size={20} color="white" />
              </div>
            </div>
            {/* Mini Chart */}
              <div style={{ height: '40px', display: 'flex', alignItems: 'end', gap: '2px' }}>
              {[70, 75, 68, 82, 78, 85, 88].map((height, index) => (
                <div
                  key={index}
                  style={{
                      backgroundColor: '#f59e0b',
                    borderRadius: '2px 2px 0 0',
                    height: `${height}%`,
                      width: '8px'
                  }}
                  />
              ))}
            </div>
          </div>

            {/* Campaign Stats */}
          <div style={{
            backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>Campaign Status</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {campaignsLoading ? '...' : Array.isArray(campaigns) ? 
                    campaigns.filter(c => c.status === 'active').length + ' Active' : '0 Active'}
                </p>
                  <p style={{ fontSize: '10px', color: '#3b82f6', margin: '4px 0 0 0' }}>
                    {campaignsLoading ? '' : Array.isArray(campaigns) ? 
                      `${campaigns.filter(c => c.status === 'planned').length} Planned, ${campaigns.filter(c => c.status === 'completed').length} Completed` : ''}
                  </p>
              </div>
                <div style={{ padding: '12px', backgroundColor: '#7c3aed', borderRadius: '8px' }}>
                <Megaphone size={20} color="white" />
              </div>
            </div>
            {/* Mini Chart */}
              <div style={{ height: '40px', display: 'flex', alignItems: 'end', gap: '2px' }}>
              {[45, 50, 55, 60, 65, 70, 75].map((height, index) => (
                <div
                  key={index}
                  style={{
                      backgroundColor: '#7c3aed',
                    borderRadius: '2px 2px 0 0',
                    height: `${height}%`,
                      width: '8px'
                  }}
                  />
              ))}
          </div>
        </div>


            {/* Recent Activity */}
          <div style={{
            backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
              padding: '20px',
              gridColumn: 'span 2'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Recent Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ padding: '6px', backgroundColor: '#10b981', borderRadius: '4px' }}>
                    <CheckCircle size={12} color="white" />
          </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '500', color: '#111827', margin: 0 }}>New campaign created</p>
                    <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>2 hours ago</p>
        </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ padding: '6px', backgroundColor: '#3b82f6', borderRadius: '4px' }}>
                    <Users size={12} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '500', color: '#111827', margin: 0 }}>Employee rating updated</p>
                    <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>4 hours ago</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ padding: '6px', backgroundColor: '#f59e0b', borderRadius: '4px' }}>
                    <Calendar size={12} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '500', color: '#111827', margin: 0 }}>Task completed</p>
                    <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>6 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Operation Employees</h2>
            </div>

            {employeesLoading ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Loading employees...</div>
              </div>
            ) : employeesError ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <div style={{ fontSize: '14px', color: '#ef4444' }}>Error: {employeesError}</div>
              </div>
            ) : Array.isArray(employees) && employees.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {employees.map((employee) => (
                    <div key={employee.id || employee._id} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                          {employee.firstName} {employee.lastName}
                          </h3>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          {employee.position || 'Operation Staff'}
                          </p>
                        </div>
                        <div style={{
                        padding: '4px 8px',
                        backgroundColor: getRatingColor(getOverallRating(employee)) + '20',
                        color: getRatingColor(getOverallRating(employee)),
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}>
                        Avg: {getOverallRating(employee)}/5
                        </div>
                      </div>

                        <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Efficiency</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{(employeeRatings[employee.id || employee._id]?.efficiency || employee.efficiency || employee.rating?.efficiency || 1)}/5</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                        value={employeeRatings[employee.id || employee._id]?.efficiency || employee.efficiency || employee.rating?.efficiency || 1}
                        onChange={(e) => handleRatingChange(employee.id || employee._id, 'efficiency', e.target.value)}
                            style={{
                              width: '100%',
                              height: '4px',
                              borderRadius: '2px',
                          background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`,
                          outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Performance</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{(employeeRatings[employee.id || employee._id]?.performance || employee.performance || employee.rating?.performance || 1)}/5</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                        value={employeeRatings[employee.id || employee._id]?.performance || employee.performance || employee.rating?.performance || 1}
                        onChange={(e) => handleRatingChange(employee.id || employee._id, 'performance', e.target.value)}
                            style={{
                              width: '100%',
                              height: '4px',
                              borderRadius: '2px',
                          background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`,
                          outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Teamwork</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{(employeeRatings[employee.id || employee._id]?.teamwork || employee.teamwork || employee.rating?.teamwork || 1)}/5</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                        value={employeeRatings[employee.id || employee._id]?.teamwork || employee.teamwork || employee.rating?.teamwork || 1}
                        onChange={(e) => handleRatingChange(employee.id || employee._id, 'teamwork', e.target.value)}
                            style={{
                              width: '100%',
                              height: '4px',
                              borderRadius: '2px',
                          background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`,
                          outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                        </div>

                    {/* Note Field */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', color: '#6b7280' }}>Note (Optional)</span>
                      </div>
                      <textarea
                        placeholder="Add a note about this rating... (minimum 5 characters)"
                        value={employeeNotes[employee.id || employee._id] || ''}
                        onChange={(e) => handleNoteChange(employee.id || employee._id, e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '60px',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          resize: 'vertical',
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                        minLength={5}
                        maxLength={500}
                      />
                      <div style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'right', marginTop: '4px' }}>
                        {(employeeNotes[employee.id || employee._id] || '').length}/500
                      </div>
                      
                      {/* Display Submitted Note under the input field */}
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#6b7280' }}>Submitted Note:</span>
                        </div>
                        <div style={{
                          padding: '8px 12px',
                          backgroundColor: '#f0f9ff',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#1e40af',
                          border: '1px solid #bfdbfe',
                          fontStyle: 'italic',
                          minHeight: '40px'
                        }}>
                          {employee.note || 'No note submitted yet'}
                        </div>
                        </div>
                      </div>


                    {/* Submit Rating Button */}
                    <div style={{ marginTop: '16px' }}>
                      <button
                        onClick={() => handleSubmitRating(employee.id || employee._id)}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          backgroundColor: '#1c242e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#1c242e'}
                      >
                        Submit Rating
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>No employees found</div>
              </div>
            )}
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>Marketing Campaigns</h2>
              <button
                onClick={() => setShowCreateCampaign(true)}
                disabled={!canCreateCampaigns(user)}
                style={{
                display: 'flex',
                alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: canCreateCampaigns(user) ? '#0891b2' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: canCreateCampaigns(user) ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (canCreateCampaigns(user)) {
                    e.target.style.backgroundColor = '#0e7490';
                  }
                }}
                onMouseOut={(e) => {
                  if (canCreateCampaigns(user)) {
                    e.target.style.backgroundColor = '#0891b2';
                  }
                }}
                title={canCreateCampaigns(user) ? "Create new campaign" : "Permission denied - Admin only"}
              >
                <Plus size={16} />
                Create Campaign
              </button>
            </div>

            {campaignsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading campaigns...</div>
              </div>
            ) : campaignsError ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#ef4444' }}>Error: {campaignsError}</div>
              </div>
            ) : Array.isArray(campaigns) && campaigns.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                {campaigns.map((campaign) => {
                  const status = getCampaignStatus(campaign);
                  return (
                  <div key={campaign.id || campaign._id} style={{
                      backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                            {campaign.name}
                      </h3>
                          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                            {campaign.description}
                          </p>
                        </div>
                        <select
                          value={campaign.status || 'planned'}
                          onChange={(e) => handleQuickStatusUpdate(campaign.id || campaign._id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: status.color + '20',
                            color: status.color,
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            border: '1px solid ' + status.color + '40',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="planned">Planned</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                        {campaign.budget && (
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Budget: </span>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>${campaign.budget}</span>
                        </div>
                      )}

                      {(campaign.startDate || campaign.endDate) && (
                        <div style={{ marginBottom: '16px', fontSize: '12px', color: '#6b7280' }}>
                          {campaign.startDate && (
                            <span style={{ marginRight: '16px' }}>
                              📅 Start: {new Date(campaign.startDate).toLocaleDateString()}
                            </span>
                          )}
                          {campaign.endDate && (
                            <span>
                              📅 End: {new Date(campaign.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEditCampaign(campaign)}
                          style={{
                            padding: '6px 12px',
                          backgroundColor: '#1c242e',
                          color: 'white',
                          border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                          fontWeight: '500',
                            cursor: 'pointer'
                      }}
                      >
                        Edit
                      </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id || campaign._id)}
                          style={{
                            padding: '6px 12px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                          fontWeight: '500',
                            cursor: 'pointer'
                      }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>No campaigns found</div>
              </div>
            )}
          </div>
        )}


        {/* Create Campaign Modal */}
        {showCreateCampaign && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
              maxWidth: '500px'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                Create New Campaign
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
                handleCreateCampaign();
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Campaign Name *
                </label>
                <input
                  type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name (3-50 characters)"
                    minLength={3}
                    maxLength={50}
                    required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Description
                  </label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter campaign description (optional, max 500 characters)"
                    rows={3}
                    maxLength={500}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {newCampaign.description.length}/500 characters
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                      Start Date *
                </label>
                <input
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Status
                </label>
                <select
                  value={newCampaign.status}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, status: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Notes
                </label>
                <textarea
                  value={newCampaign.notes}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter additional notes (optional, max 500 characters)"
                  rows={3}
                  maxLength={500}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {newCampaign.notes.length}/500 characters
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                      setShowCreateCampaign(false);
                      setNewCampaign({
                        name: '',
                        description: '',
                        startDate: '',
                        endDate: '',
                        status: 'planned',
                        notes: ''
                      });
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#0891b2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Create Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Campaign Modal */}
        {showEditCampaign && editingCampaign && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px'
            }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                Edit Campaign
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateCampaign();
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Campaign Name
                </label>
                <input
                  type="text"
                    value={editingCampaign.name || ''}
                    onChange={(e) => setEditingCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name (3-50 characters)"
                    minLength={3}
                    maxLength={50}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Description
                  </label>
                  <textarea
                    value={editingCampaign.description || ''}
                    onChange={(e) => setEditingCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter campaign description (optional, max 500 characters)"
                    rows={3}
                    maxLength={500}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {(editingCampaign.description || '').length}/500 characters
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editingCampaign.startDate || ''}
                      onChange={(e) => setEditingCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editingCampaign.endDate || ''}
                      onChange={(e) => setEditingCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Status
                  </label>
                  <select
                    value={editingCampaign.status || 'planned'}
                    onChange={(e) => setEditingCampaign(prev => ({ ...prev, status: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Notes
                  </label>
                  <textarea
                    value={editingCampaign.notes || ''}
                    onChange={(e) => setEditingCampaign(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter additional notes (optional, max 500 characters)"
                    rows={3}
                    maxLength={500}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {(editingCampaign.notes || '').length}/500 characters
                  </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                      setShowEditCampaign(false);
                      setEditingCampaign(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#0891b2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Update Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Ticket Modal */}
        {showCreateTicket && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px'
            }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                Submit New Ticket
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateTicket();
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Issue Type *
                  </label>
                  <select
                    value={newTicket.title}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Select an issue type</option>
                    <option value="Login Issues">Login Issues</option>
                    <option value="Password Reset">Password Reset</option>
                    <option value="Account Access">Account Access</option>
                    <option value="Email Not Working">Email Not Working</option>
                    <option value="Internet Connection">Internet Connection</option>
                    <option value="WiFi Problems">WiFi Problems</option>
                    <option value="Computer Slow">Computer Slow</option>
                    <option value="Computer Won't Start">Computer Won't Start</option>
                    <option value="Blue Screen Error">Blue Screen Error</option>
                    <option value="Software Installation">Software Installation</option>
                    <option value="Software Not Working">Software Not Working</option>
                    <option value="Printer Issues">Printer Issues</option>
                    <option value="Scanner Problems">Scanner Problems</option>
                    <option value="Database Access">Database Access</option>
                    <option value="File Access Issues">File Access Issues</option>
                    <option value="Network Drive Problems">Network Drive Problems</option>
                    <option value="VPN Connection">VPN Connection</option>
                    <option value="Remote Access Issues">Remote Access Issues</option>
                    <option value="System Updates">System Updates</option>
                    <option value="Antivirus Issues">Antivirus Issues</option>
                    <option value="Browser Problems">Browser Problems</option>
                    <option value="Website Not Loading">Website Not Loading</option>
                    <option value="Performance Issues">Performance Issues</option>
                    <option value="Memory Problems">Memory Problems</option>
                    <option value="Storage Issues">Storage Issues</option>
                    <option value="Backup Problems">Backup Problems</option>
                    <option value="Data Recovery">Data Recovery</option>
                    <option value="Hardware Failure">Hardware Failure</option>
                    <option value="Keyboard Issues">Keyboard Issues</option>
                    <option value="Mouse Problems">Mouse Problems</option>
                    <option value="Monitor Issues">Monitor Issues</option>
                    <option value="Audio Problems">Audio Problems</option>
                    <option value="Camera Not Working">Camera Not Working</option>
                    <option value="Microphone Issues">Microphone Issues</option>
                    <option value="USB Port Problems">USB Port Problems</option>
                    <option value="Bluetooth Issues">Bluetooth Issues</option>
                    <option value="Mobile Device Sync">Mobile Device Sync</option>
                    <option value="Application Crashes">Application Crashes</option>
                    <option value="Data Loss">Data Loss</option>
                    <option value="Permission Issues">Permission Issues</option>
                    <option value="Security Concerns">Security Concerns</option>
                    <option value="Phishing Attempts">Phishing Attempts</option>
                    <option value="Suspicious Activity">Suspicious Activity</option>
                    <option value="License Issues">License Issues</option>
                    <option value="Configuration Problems">Configuration Problems</option>
                    <option value="Integration Issues">Integration Issues</option>
                    <option value="API Problems">API Problems</option>
                    <option value="Server Issues">Server Issues</option>
                    <option value="Database Errors">Database Errors</option>
                    <option value="Cloud Service Problems">Cloud Service Problems</option>
                    <option value="Third-party Software">Third-party Software</option>
                    <option value="Mobile App Issues">Mobile App Issues</option>
                    <option value="Web Application Problems">Web Application Problems</option>
                    <option value="Other Technical Issue">Other Technical Issue</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Description *
                  </label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the issue in detail (10-500 characters)"
                    rows={4}
                    minLength={10}
                    maxLength={500}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                    required
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {newTicket.description.length}/500 characters
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTicket(false);
                      setNewTicket({
                        title: '',
                        description: '',
                        priority: 'medium'
                      });
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1c242e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                    Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* Create Operation Leave Modal */}
        {showCreateOperationLeave && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px'
            }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                Submit Leave Request
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateOperationLeave();
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Leave Type *
                  </label>
                  <select
                    value={newOperationLeave.type}
                    onChange={(e) => setNewOperationLeave(prev => ({ ...prev, type: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="annual">Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newOperationLeave.startDate}
                    onChange={(e) => setNewOperationLeave(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={newOperationLeave.endDate}
                    onChange={(e) => setNewOperationLeave(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateOperationLeave(false);
                      setNewOperationLeave({
                        startDate: '',
                        endDate: '',
                        type: 'annual'
                      });
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Leave
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OperationDepartment;