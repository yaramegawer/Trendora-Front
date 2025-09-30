import { useState } from 'react';
import { 
  Users, 
  Ticket, 
  FolderOpen, 
  Plus, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Edit3,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  Code,
  Monitor,
  Database,
  Cloud,
  Wifi,
  Server
} from 'lucide-react';
import { useITEmployees, useITProjects, useITTickets } from '../../hooks/useITData';
import { useAuth } from '../../contexts/AuthContext';

const ITDepartment = () => {
  // Get user from auth context
  const { user } = useAuth();
  
  // Use real API data
  const { employees, loading: employeesLoading, error: employeesError, updateRating } = useITEmployees();
  const { projects, loading: projectsLoading, error: projectsError, createProject, updateProject, deleteProject } = useITProjects();
  const { tickets, loading: ticketsLoading, error: ticketsError, updateTicket, deleteTicket } = useITTickets();


  // Debug logging
  console.log('IT Department Styled Debug:');
  console.log('- employees:', employees);
  console.log('- employeesLoading:', employeesLoading);
  console.log('- employeesError:', employeesError);
  console.log('- employees type:', typeof employees);
  console.log('- employees isArray:', Array.isArray(employees));
  console.log('- employees length:', employees?.length);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planned',
    members: [],
    notes: '',
    startDate: '',
    endDate: ''
  });



  // State for employee ratings
  const [employeeRatings, setEmployeeRatings] = useState({});
  
  // State for forms
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // State for project editing
  const [editingProject, setEditingProject] = useState(null);
  const [showEditProject, setShowEditProject] = useState(false);
  
  // State for ticket editing
  const [editingTicket, setEditingTicket] = useState(null);
  const [showEditTicket, setShowEditTicket] = useState(false);
  
  // State for leave form
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [newLeave, setNewLeave] = useState({
    type: '',
    startDate: '',
    endDate: ''
  });
  
  // Debug logging
  console.log('IT Department - showEmployeeForm:', showEmployeeForm);
  console.log('IT Department - editingEmployee:', editingEmployee);

  // Function to get rating for a specific employee and category
  const getRating = (employeeId, category) => {
    // First try to get from local state
    const key = `${employeeId}-${category}`;
    const localRating = employeeRatings[key];
    if (localRating !== undefined) {
      return localRating;
    }
    
    // If not in local state, try to get from database
    const employee = employees.find(emp => (emp.id || emp._id) === employeeId);
    if (employee && employee.rating && typeof employee.rating === 'object') {
      return Math.max(employee.rating[category] || 1, 1);
    }
    
    return 1; // Default to 1 if not set (minimum required by backend)
  };

  // Function to get average rating for an employee
  const getAverageRating = (employeeId) => {
    const performance = getRating(employeeId, 'performance');
    const efficiency = getRating(employeeId, 'efficiency');
    const teamwork = getRating(employeeId, 'teamwork');
    return Math.round((performance + efficiency + teamwork) / 3);
  };

  // Function to get employee name from leave object or ID
  const getEmployeeName = (leave) => {
    // Check if employee is populated in the leave object
    if (leave.employee && leave.employee.firstName && leave.employee.lastName) {
      return `${leave.employee.firstName} ${leave.employee.lastName}`;
    }
    
    // Fallback to employeeId lookup if populate didn't work
    const employeeId = leave.employeeId || leave;
    const employee = employees.find(emp => (emp.id || emp._id) === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : `Employee ID: ${employeeId}`;
  };

  // Function to update rating and save to backend
  const updateLocalRating = async (employeeId, category, value) => {
    const key = `${employeeId}-${category}`;
    setEmployeeRatings(prev => ({
      ...prev,
      [key]: parseInt(value)
    }));
    
    // Get current ratings for this employee
    const currentRatings = employeeRatings;
    const updatedRatings = {
      ...currentRatings,
      [key]: parseInt(value)
    };
    
    // Extract individual ratings (ensure minimum value of 1)
    const efficiency = Math.max(updatedRatings[`${employeeId}-efficiency`] || 1, 1);
    const performance = Math.max(updatedRatings[`${employeeId}-performance`] || 1, 1);
    const teamwork = Math.max(updatedRatings[`${employeeId}-teamwork`] || 1, 1);
    
    // Auto-save to backend with all three required fields
    try {
      await updateRating(employeeId, {
        efficiency: efficiency,
        performance: performance,
        teamwork: teamwork
      });
      console.log(`Rating saved to backend: ${category} = ${value} for employee ${employeeId}`);
    } catch (error) {
      console.error('Failed to save rating to backend:', error);
    }
  };

  const getOverallRating = (employee) => {
    // Use the rating data from the database (employee.rating object)
    if (employee.rating && typeof employee.rating === 'object') {
      const efficiency = employee.rating.efficiency || 0;
      const performance = employee.rating.performance || 0;
      const teamwork = employee.rating.teamwork || 0;
      return Math.round((efficiency + performance + teamwork) / 3);
    }
    
    // Fallback to local ratings if database rating not available
    if (!employee.ratings || !Array.isArray(employee.ratings)) return 0;
    const total = employee.ratings.reduce((sum, rating) => sum + (rating.rating || 0), 0);
    return Math.round(total / employee.ratings.length) || 0;
  };

  // Star rating component
  const StarRating = ({ rating, maxRating = 5 }) => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= rating ? '#fbbf24' : '#d1d5db',
            fontSize: '14px',
            marginRight: '2px'
          }}
        >
          ★
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {stars}
        <span style={{ marginLeft: '4px', fontSize: '12px', color: '#6b7280' }}>
          ({rating}/5)
        </span>
      </span>
    );
  };

  const handleCreateProject = async () => {
    // Validate required fields
    if (!newProject.name.trim()) {
      alert('Project name is required');
      return;
    }
    if (!newProject.description.trim()) {
      alert('Project description is required');
      return;
    }
    
    try {
      // Filter data to only include allowed fields per backend schema
      const createData = {
        name: newProject.name,
        description: newProject.description,
        status: newProject.status,
        notes: newProject.notes || '',
        ...(newProject.startDate && { startDate: newProject.startDate }),
        ...(newProject.endDate && { endDate: newProject.endDate })
      };
      
      // Only include members if they exist and are valid ObjectIds
      if (newProject.members && newProject.members.length > 0) {
        // If members are populated objects, extract their IDs
        const memberIds = newProject.members.map(member => {
          if (typeof member === 'object' && member._id) {
            return member._id;
          } else if (typeof member === 'string') {
            return member;
          }
          return null;
        }).filter(id => id !== null);
        
        if (memberIds.length > 0) {
          createData.members = memberIds;
        }
      }
      
      console.log('Creating project with filtered data:', createData);
      await createProject(createData);
      alert('Project created successfully!');
      setNewProject({
        name: '',
        description: '',
        status: 'planned',
        members: [],
        notes: '',
        startDate: '',
        endDate: ''
      });
      setShowCreateProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project: ' + error.message);
    }
  };

  const handleUpdateRating = async (employeeId, newRating) => {
    try {
      await updateRating(employeeId, { rating: newRating });
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };


  // Leave form handlers


  const handleUpdateTicket = async (ticketId, updates) => {
    try {
      // Only send status updates as per backend schema
      if (updates.status) {
        await updateTicket(ticketId, { status: updates.status });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setShowEditTicket(true);
  };

  // Project edit handlers
  const handleEditProject = (project) => {
    console.log('Editing project:', project);
    console.log('Project ID:', project.id || project._id);
    setEditingProject(project);
    setShowEditProject(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    
    // Get and validate project ID
    const projectId = editingProject.id || editingProject._id;
    if (!projectId) {
      alert('Project ID is missing. Cannot update project.');
      return;
    }

    // Validate required fields
    if (!editingProject.name.trim()) {
      alert('Project name is required');
      return;
    }
    if (!editingProject.description.trim()) {
      alert('Project description is required');
      return;
    }

    try {
      // Filter data to only include allowed fields per backend schema
      const updateData = {
        name: editingProject.name,
        description: editingProject.description,
        status: editingProject.status,
        notes: editingProject.notes || '',
        ...(editingProject.startDate && { startDate: editingProject.startDate }),
        ...(editingProject.endDate && { endDate: editingProject.endDate })
      };
      
      // Only include members if they exist and are valid ObjectIds
      if (editingProject.members && editingProject.members.length > 0) {
        // If members are populated objects, extract their IDs
        const memberIds = editingProject.members.map(member => {
          if (typeof member === 'object' && member._id) {
            return member._id;
          } else if (typeof member === 'string') {
            return member;
          }
          return null;
        }).filter(id => id !== null);
        
        if (memberIds.length > 0) {
          updateData.members = memberIds;
        }
      }
      
      console.log('Updating project with ID:', projectId);
      console.log('Updating project with filtered data:', updateData);
      await updateProject(projectId, updateData);
      alert('Project updated successfully!');
      setShowEditProject(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project: ' + error.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!projectId) {
      alert('Project ID is missing. Cannot delete project.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    try {
      console.log('Deleting project with ID:', projectId);
      await deleteProject(projectId);
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project: ' + error.message);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket(ticketId);
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };


  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Leave form handler
  const handleCreateLeave = async () => {
    try {
      if (!newLeave.type || !newLeave.startDate || !newLeave.endDate) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate date range
      const startDate = new Date(newLeave.startDate);
      const endDate = new Date(newLeave.endDate);
      
      if (startDate >= endDate) {
        alert('End date must be after start date');
        return;
      }

      const leaveData = {
        type: newLeave.type,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        status: 'pending'
      };

      const result = await itLeaveApi.addLeave(leaveData);
      
      // The API returns data directly on success, or throws error on failure
      alert('Leave request submitted successfully!');
      setNewLeave({
        type: '',
        startDate: '',
        endDate: ''
      });
      setShowLeaveForm(false);
    } catch (error) {
      console.error('Error creating leave:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Unknown error occurred';
      alert('Failed to submit leave request: ' + errorMessage);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#1c242e';
      case 'Planning': return '#f59e0b';
      case 'On Hold': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'grey.50',
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px'
    }}>

      <div style={{ padding: '32px' }}>
        {/* Enhanced Stats Cards with Charts */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Total Employees</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {employeesLoading ? '...' : Array.isArray(employees) ? employees.length : 0}
                </p>
                <p style={{ fontSize: '8px', color: '#10b981', marginTop: '4px', margin: 0 }}>+12% from last month</p>
              </div>
              <div style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #1c242e 0%, #334155 100%)',
                borderRadius: '10px'
              }}>
                <Users size={20} color="white" />
              </div>
            </div>
            {/* Mini Chart */}
            <div style={{ height: '64px', display: 'flex', alignItems: 'end', gap: '4px' }}>
              {[65, 72, 68, 80, 75, 85, 90].map((height, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                    borderRadius: '2px 2px 0 0',
                    height: `${height}%`,
                    width: '12px'
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Open Tickets</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {ticketsLoading ? '...' : Array.isArray(tickets) ? tickets.filter(t => t.status === 'open' || !t.handled).length : 0}
                </p>
                <p style={{ fontSize: '8px', color: '#ef4444', marginTop: '4px', margin: 0 }}>+3 new today</p>
              </div>
              <div style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #1c242e 0%, #334155 100%)',
                borderRadius: '10px'
              }}>
                <Ticket size={20} color="white" />
              </div>
            </div>
            {/* Mini Chart */}
            <div style={{ height: '64px', display: 'flex', alignItems: 'end', gap: '4px' }}>
              {[40, 35, 45, 30, 25, 20, 15].map((height, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(to top, #ef4444, #f87171)',
                    borderRadius: '2px 2px 0 0',
                    height: `${height}%`,
                    width: '12px'
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Active Projects</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {projectsLoading ? '...' : Array.isArray(projects) ? projects.length : 0}
                </p>
                <p style={{ fontSize: '8px', color: '#1c242e', marginTop: '4px', margin: 0 }}>2 due this week</p>
              </div>
              <div style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #1c242e 0%, #334155 100%)',
                borderRadius: '10px'
              }}>
                <FolderOpen size={20} color="white" />
              </div>
            </div>
            {/* Mini Chart */}
            <div style={{ height: '64px', display: 'flex', alignItems: 'end', gap: '4px' }}>
              {[55, 60, 65, 70, 75, 80, 85].map((height, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(to top, #10b981, #34d399)',
                    borderRadius: '2px 2px 0 0',
                    height: `${height}%`,
                    width: '12px'
                  }}
                ></div>
              ))}
            </div>
          </div>

        </div>


        {/* Enhanced Navigation Tabs */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '8px'
          }}>
            <nav style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Activity },
                { id: 'employees', label: 'Employees', icon: Users },
                { id: 'tickets', label: 'Tickets', icon: Ticket },
                { id: 'projects', label: 'Projects', icon: FolderOpen }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#1c242e' : 'transparent',
                      color: isActive ? 'white' : '#6b7280',
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.color = '#374151';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
                      }
                    }}
                  >
                    <IconComponent size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>


        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                IT Dashboard
              </h2>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Overview of IT department activities and quick actions
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px', 
              padding: '24px', 
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowCreateProject(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: '#0891b2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0e7490'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#0891b2'}
                >
                  <FolderOpen size={16} />
                  New Project
                </button>

                <button
                  onClick={() => setShowLeaveForm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                >
                  <Plus size={16} />
                  Submit Leave
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Users size={20} color="#3b82f6" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>Total Employees</h4>
                    <p style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                      {employeesLoading ? '...' : Array.isArray(employees) ? employees.length : 0}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: '#fef3c7', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Ticket size={20} color="#d97706" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>Open Tickets</h4>
                    <p style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                      {ticketsLoading ? '...' : Array.isArray(tickets) ? tickets.filter(t => t.status === 'open' || !t.handled).length : 0}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: '#d1fae5', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <FolderOpen size={20} color="#059669" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>Active Projects</h4>
                    <p style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                      {projectsLoading ? '...' : Array.isArray(projects) ? projects.length : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>IT Employees</h2>
            </div>


            {employeesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading employees...</div>
              </div>
            ) : employeesError ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#ef4444' }}>Error: {employeesError}</div>
              </div>
            ) : Array.isArray(employees) && employees.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {employees.map((employee) => {
                  const rating = getOverallRating(employee);
                  return (
                    <div key={employee.id || employee._id} style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#1c242e';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(28, 36, 46, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                            {employee.name || employee.firstName || 'Unknown Employee'}
                          </h3>
                          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                            {employee.position || employee.role || 'IT Specialist'}
                          </p>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#f3f4f6',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>
                            Average: {rating}/5
                          </span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        {/* Performance Rating */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>Performance</span>
                            <span style={{ fontSize: '10px', color: '#111827', fontWeight: '500' }}>
                              {getRating(employee.id || employee._id, 'performance')}/5
                            </span>
                          </div>
                          <input
                            id={`performance-rating-${employee.id || employee._id}`}
                            type="range"
                            min="1"
                            max="5"
                            value={getRating(employee.id || employee._id, 'performance')}
                            style={{
                              width: '100%',
                              height: '4px',
                              background: 'linear-gradient(to right, #e5e7eb 0%, #e5e7eb 60%, #e5e7eb 100%)',
                              outline: 'none',
                              borderRadius: '2px',
                              cursor: 'pointer'
                            }}
                            onChange={(e) => {
                              const employeeId = employee.id || employee._id;
                              const value = e.target.value;
                              const key = `${employeeId}-performance`;
                              setEmployeeRatings(prev => ({
                                ...prev,
                                [key]: parseInt(value)
                              }));
                              console.log(`Performance rating for ${employee.name || employee.firstName || 'Employee'} set to: ${value}`);
                            }}
                          />
                        </div>

                        {/* Efficiency Rating */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>Efficiency</span>
                            <span style={{ fontSize: '10px', color: '#111827', fontWeight: '500' }}>
                              {getRating(employee.id || employee._id, 'efficiency')}/5
                            </span>
                          </div>
                          <input
                            id={`efficiency-rating-${employee.id || employee._id}`}
                            type="range"
                            min="1"
                            max="5"
                            value={getRating(employee.id || employee._id, 'efficiency')}
                            style={{
                              width: '100%',
                              height: '4px',
                              background: 'linear-gradient(to right, #e5e7eb 0%, #e5e7eb 60%, #e5e7eb 100%)',
                              outline: 'none',
                              borderRadius: '2px',
                              cursor: 'pointer'
                            }}
                            onChange={(e) => {
                              const employeeId = employee.id || employee._id;
                              const value = e.target.value;
                              const key = `${employeeId}-efficiency`;
                              setEmployeeRatings(prev => ({
                                ...prev,
                                [key]: parseInt(value)
                              }));
                              console.log(`Efficiency rating for ${employee.name || employee.firstName || 'Employee'} set to: ${value}`);
                            }}
                          />
                        </div>

                        {/* Teamwork Rating */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>Teamwork</span>
                            <span style={{ fontSize: '10px', color: '#111827', fontWeight: '500' }}>
                              {getRating(employee.id || employee._id, 'teamwork')}/5
                            </span>
                          </div>
                          <input
                            id={`teamwork-rating-${employee.id || employee._id}`}
                            type="range"
                            min="1"
                            max="5"
                            value={getRating(employee.id || employee._id, 'teamwork')}
                            style={{
                              width: '100%',
                              height: '4px',
                              background: 'linear-gradient(to right, #e5e7eb 0%, #e5e7eb 60%, #e5e7eb 100%)',
                              outline: 'none',
                              borderRadius: '2px',
                              cursor: 'pointer'
                            }}
                            onChange={(e) => {
                              const employeeId = employee.id || employee._id;
                              const value = e.target.value;
                              const key = `${employeeId}-teamwork`;
                              setEmployeeRatings(prev => ({
                                ...prev,
                                [key]: parseInt(value)
                              }));
                              console.log(`Teamwork rating for ${employee.name || employee.firstName || 'Employee'} set to: ${value}`);
                            }}
                          />
                      </div>

                        {/* Note Field */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>Note (Optional)</span>
                          </div>
                          <textarea
                            id={`rating-note-${employee.id || employee._id}`}
                            placeholder="Add a note about this rating... (minimum 2 characters)"
                            value={employeeRatings[`${employee.id || employee._id}-note`] || ''}
                            onChange={(e) => {
                              const employeeId = employee.id || employee._id;
                              const value = e.target.value;
                              const key = `${employeeId}-note`;
                              setEmployeeRatings(prev => ({
                                ...prev,
                                [key]: value
                              }));
                            }}
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
                            minLength={0}
                            maxLength={500}
                          />
                          <div style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'right', marginTop: '4px' }}>
                            {(employeeRatings[`${employee.id || employee._id}-note`] || '').length}/500
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
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{
                          flex: 1,
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const employeeId = employee.id || employee._id;
                          
                          // Get current ratings for this employee
                          const efficiency = getRating(employeeId, 'efficiency');
                          const performance = getRating(employeeId, 'performance');
                          const teamwork = getRating(employeeId, 'teamwork');
                          
                          try {
                            // Backend expects efficiency, performance, teamwork, and optional note
                            // Employee ID is already in the URL path
                            const note = employeeRatings[`${employeeId}-note`] || '';
                            
                            // Note validation removed - backend will handle validation
                            
                            // Validate rating values
                            if (!efficiency || !performance || !teamwork) {
                              alert('Please provide all rating values before submitting.');
                              return;
                            }
                            
                            if (efficiency < 1 || efficiency > 5 || 
                                performance < 1 || performance > 5 || 
                                teamwork < 1 || teamwork > 5) {
                              alert('Rating values must be between 1 and 5.');
                              return;
                            }
                            
                            const employeeName = employee?.firstName || employee?.name || employee?.employeeName || 'Employee';
                            const autoNote = `Rating updated for ${employeeName} - Performance: ${performance}, Efficiency: ${efficiency}, Teamwork: ${teamwork}`;
                            const finalNote = note || autoNote;
                            
                            console.log('Note length check:');
                            console.log('- User note:', note);
                            console.log('- Auto note:', autoNote);
                            console.log('- Final note:', finalNote);
                            console.log('- Final note length:', finalNote.length);
                            
                            // Final validation removed - backend will handle validation
                            
                            const ratingData = {
                              efficiency: efficiency,
                              performance: performance,
                              teamwork: teamwork,
                              note: finalNote
                            };
                            
                            console.log('Sending rating data:', ratingData);
                            await updateRating(employeeId, ratingData);
                            console.log(`Rating submitted for ${employee.name || employee.firstName}:`, ratingData);
                            
                            // Clear the note field after successful submission
                            const noteKey = `${employeeId}-note`;
                            setEmployeeRatings(prev => ({
                              ...prev,
                              [noteKey]: ''
                            }));
                            
                            alert('Rating submitted successfully!');
                            
                            // Note: The employee data will be refreshed on next page load
                            // The note will appear after page refresh
                          } catch (error) {
                            console.error('Failed to submit rating:', error);
                            console.error('Error details:', error.message);
                            console.error('Error response:', error.response);
                            console.error('Error status:', error.response?.status);
                            console.error('Error data:', error.response?.data);
                            
                            // Provide more specific error message
                            let errorMessage = 'Failed to submit rating. Please try again.';
                            if (error.response?.data?.message) {
                              errorMessage = `Failed to submit rating: ${error.response.data.message}`;
                            } else if (error.message) {
                              errorMessage = `Failed to submit rating: ${error.message}`;
                            }
                            alert(errorMessage);
                          }
                        }}
                        >
                          Submit Rating
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>No employees found</div>
                <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
                  Debug: employees={JSON.stringify(employees)}, isArray={Array.isArray(employees)}, length={employees?.length}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Similar styled content for tickets and projects tabs would go here */}
        {activeTab === 'tickets' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>Support Tickets</h2>
            </div>
            {ticketsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading tickets...</div>
              </div>
            ) : Array.isArray(tickets) && tickets.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {tickets.map((ticket) => (
                  <div key={ticket.id || ticket._id} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                        {ticket.title || 'Support Ticket'}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
                        {ticket.description || 'No description available'}
                      </p>
                      {ticket.employee && (
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>
                          Submitted by: {ticket.employee.firstName} {ticket.employee.lastName}
                          {ticket.employee.email && ` (${ticket.employee.email})`}
                        </p>
                      )}
                      {(ticket.createdAt || ticket.created_at || ticket.submittedDate) && (
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                          <Clock size={12} style={{ marginRight: '4px', display: 'inline' }} />
                          Created: {new Date(ticket.createdAt || ticket.created_at || ticket.submittedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: getPriorityColor(ticket.priority) + '20',
                        color: getPriorityColor(ticket.priority)
                      }}>
                        {ticket.priority || 'Medium'}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: ticket.status === 'resolved' ? '#10b981' : ticket.status === 'in_progress' ? '#f59e0b' : '#6b7280',
                        color: 'white'
                      }}>
                        {ticket.status || 'open'}
                      </span>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: '#1c242e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleEditTicket(ticket)}
                      >
                        Edit
                      </button>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDeleteTicket(ticket.id || ticket._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>No tickets found</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>Projects</h2>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                backgroundColor: '#1c242e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={() => setShowCreateProject(true)}
              onMouseOver={(e) => e.target.style.backgroundColor = '#334155'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#1c242e'}
              >
                <Plus size={16} />
                New Project
              </button>
            </div>

            {projectsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading projects...</div>
              </div>
            ) : Array.isArray(projects) && projects.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {projects.map((project) => (
                  <div key={project.id || project._id} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                        {project.name || 'Project'}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                        {project.description || 'No description available'}
                      </p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: getStatusColor(project.status) + '20',
                          color: getStatusColor(project.status)
                        }}>
                          {project.status || 'Planning'}
                        </span>
                      </div>
                      {(project.startDate || project.endDate) && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                          {project.startDate && (
                            <span style={{ marginRight: '16px' }}>
                              📅 Start: {new Date(project.startDate).toLocaleDateString()}
                        </span>
                          )}
                          {project.endDate && (
                            <span>
                              📅 End: {new Date(project.endDate).toLocaleDateString()}
                            </span>
                          )}
                      </div>
                      )}
                      {project.members && project.members.length > 0 && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500', marginRight: '8px' }}>👥 Team:</span>
                          <span>
                            {project.members.map((member, index) => (
                              <span key={member._id || member.id || index}>
                                {member.firstName} {member.lastName}
                                {index < project.members.length - 1 && ', '}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: '#1c242e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleEditProject(project)}
                      >
                        Edit
                      </button>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDeleteProject(project.id || project._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>No projects found</div>
              </div>
            )}
          </div>
        )}


      </div>


      {/* Employee Form Modal */}
      {showEmployeeForm && (
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
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log('Form submitted for employee:', editingEmployee);
              setShowEmployeeForm(false);
              setEditingEmployee(null);
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="edit-employee-name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Name
                </label>
                <input
                  id="edit-employee-name"
                  type="text"
                  defaultValue={editingEmployee?.name || editingEmployee?.firstName || ''}
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
                <label htmlFor="edit-employee-email" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Email
                </label>
                <input
                  id="edit-employee-email"
                  type="email"
                  defaultValue={editingEmployee?.email || ''}
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
                <label htmlFor="edit-employee-department" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Department
                </label>
                <input
                  id="edit-employee-department"
                  type="text"
                  defaultValue={editingEmployee?.department || 'IT'}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmployeeForm(false);
                    setEditingEmployee(null);
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
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Project Form Modal */}
      {showCreateProject && (
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
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Create New Project
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateProject();
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="project-name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Project Name *
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
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
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="project-description" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Description *
                </label>
                <textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter project description"
                  rows={3}
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
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="project-status" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Status
                </label>
                <select
                  id="project-status"
                  value={newProject.status}
                  onChange={(e) => setNewProject(prev => ({ ...prev, status: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Team Members
                </label>
                <select
                  multiple
                  value={newProject.members}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setNewProject(prev => ({ ...prev, members: selectedOptions }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minHeight: '100px'
                  }}
                >
                  {employees.map(employee => (
                    <option key={employee.id || employee._id} value={employee.id || employee._id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Hold Ctrl/Cmd to select multiple members
                </small>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Notes
                </label>
                <textarea
                  value={newProject.notes}
                  onChange={(e) => setNewProject(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter project notes (optional)"
                  rows={3}
                  maxLength={1000}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  {newProject.notes.length}/1000 characters
                </small>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
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
                  End Date
                </label>
                <input
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateProject(false);
                    setNewProject({
                      name: '',
                      description: '',
                      status: 'planned',
                      members: [],
                      notes: '',
                      startDate: '',
                      endDate: ''
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProject && editingProject && (
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
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Edit Project
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProject();
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
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
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Description *
                </label>
                <textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter project description"
                  rows={3}
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
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Status
                </label>
                <select
                  value={editingProject.status}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, status: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Team Members
                </label>
                <select
                  multiple
                  value={editingProject.members || []}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setEditingProject(prev => ({ ...prev, members: selectedOptions }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minHeight: '100px'
                  }}
                >
                  {employees.map(employee => (
                    <option key={employee.id || employee._id} value={employee.id || employee._id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Hold Ctrl/Cmd to select multiple members
                </small>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Notes
                </label>
                <textarea
                  value={editingProject.notes || ''}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter project notes (optional)"
                  rows={3}
                  maxLength={1000}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  {(editingProject.notes || '').length}/1000 characters
                </small>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={editingProject.startDate || ''}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={editingProject.endDate || ''}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProject(false);
                    setEditingProject(null);
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
                  Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {showEditTicket && editingTicket && (
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
              Update Ticket Status
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                <strong>Title:</strong> {editingTicket.title}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                <strong>Description:</strong> {editingTicket.description}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
                <strong>Current Status:</strong> {editingTicket.status || 'open'}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                New Status
              </label>
              <select
                value={editingTicket.status || 'open'}
                onChange={(e) => setEditingTicket(prev => ({ ...prev, status: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowEditTicket(false);
                  setEditingTicket(null);
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
                onClick={async () => {
                  try {
                    await handleUpdateTicket(editingTicket.id || editingTicket._id, { status: editingTicket.status });
                    alert('Ticket status updated successfully!');
                    setShowEditTicket(false);
                    setEditingTicket(null);
                  } catch (error) {
                    alert('Failed to update ticket status: ' + error.message);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Form Modal */}
      {showLeaveForm && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Submit Leave Request
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateLeave();
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Leave Type *
                </label>
                <select
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({...newLeave, type: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select leave type</option>
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
                  value={newLeave.startDate}
                  onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  End Date *
                </label>
                <input
                  type="date"
                  value={newLeave.endDate}
                  onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
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

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowLeaveForm(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
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
  );
};

export default ITDepartment;
