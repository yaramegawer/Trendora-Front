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
import { canCreateProjects, showPermissionError } from '../../utils/permissions';
import ITApiTest from '../debug/ITApiTest';

const ITDepartment = () => {
  // Use real API data
  const { employees, loading: employeesLoading, error: employeesError, updateRating } = useITEmployees();
  const { projects, loading: projectsLoading, error: projectsError, createProject, updateProject, deleteProject } = useITProjects();
  const { tickets, loading: ticketsLoading, error: ticketsError, updateTicket, deleteTicket } = useITTickets();
  const { user } = useAuth();

  // Debug logging
  console.log('IT Department Debug:');
  console.log('- employees:', employees);
  console.log('- employeesLoading:', employeesLoading);
  console.log('- employeesError:', employeesError);
  console.log('- employees type:', typeof employees);
  console.log('- employees isArray:', Array.isArray(employees));
  console.log('- employees length:', employees?.length);
  console.log('- user:', user);
  console.log('- token:', localStorage.getItem('token'));
  console.log('- isAuthenticated:', localStorage.getItem('isAuthenticated'));

  // Modals
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // New project form
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectProgress, setNewProjectProgress] = useState(0);

  // View toggle: 'employees' | 'tickets' | 'projects'
  const [view, setView] = useState('employees');

  // Employee actions
  const handleEfficiencyChange = async (id, efficiency) => {
    try {
      await updateRating(id, { efficiency });
    } catch (e) {
      console.error('Failed to update efficiency', e);
    }
  };

  const handlePerformanceChange = async (id, performance) => {
    try {
      await updateRating(id, { performance });
    } catch (e) {
      console.error('Failed to update performance', e);
    }
  };

  const handleTeamworkChange = async (id, teamwork) => {
    try {
      await updateRating(id, { teamwork });
    } catch (e) {
      console.error('Failed to update teamwork', e);
    }
  };

  // Project actions
  const handleAddProject = async () => {
    if (!canCreateProjects(user)) {
      showPermissionError('create projects', user);
      return;
    }
    
    if (!newProjectName.trim()) return;
    try {
      await createProject({
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
        progress: newProjectProgress,
      });
      setShowAddProjectModal(false);
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectProgress(0);
    } catch (e) {
      console.error('Failed to add project', e);
    }
  };

  const handleProjectProgressChange = async (id, progress) => {
    
    try {
      await updateProject(id, { progress });
    } catch (e) {
      console.error('Failed to update project progress', e);
    }
  };

  const handleDeleteProject = async (id) => {
    
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
      } catch (e) {
        console.error('Failed to delete project', e);
      }
    }
  };

  // Ticket actions
  const handleTicketStatusChange = async (id, handled) => {
    
    try {
      await updateTicket(id, { handled });
    } catch (e) {
      console.error('Failed to update ticket status', e);
    }
  };

  const handleDeleteTicket = async (id) => {
    
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket(id);
      } catch (e) {
        console.error('Failed to delete ticket', e);
      }
    }
  };

  const getOverallRating = (employee) => {
    const efficiency = employee.efficiency || 0;
    const performance = employee.performance || 0;
    const teamwork = employee.teamwork || 0;
    return Math.round((efficiency + performance + teamwork) / 3);
  };

  const getRatingColor = (rating) => {
    if (rating >= 80) return 'text-green-500';
    if (rating >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProjectStatus = (progress) => {
    if (progress >= 100) return { text: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (progress >= 75) return { text: 'Almost Done', color: 'bg-blue-100 text-blue-800', icon: TrendingUp };
    if (progress >= 50) return { text: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Activity };
    if (progress >= 25) return { text: 'Started', color: 'bg-orange-100 text-orange-800', icon: Clock };
    return { text: 'Not Started', color: 'bg-gray-100 text-gray-800', icon: Clock };
  };

  const getTicketPriority = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return { color: 'bg-red-100 text-red-800', icon: AlertCircle };
      case 'medium': return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'low': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      default: return { color: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Debug Test Component */}
      <ITApiTest />
      
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                IT Department
              </h1>
              <p className="text-gray-600 mt-1">Manage employees, support tickets, and active projects</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Enhanced Stats Cards with Charts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">
                  {employeesLoading ? '...' : Array.isArray(employees) ? employees.length : 0}
                </p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* Mini Chart */}
            <div className="h-16 flex items-end space-x-1">
              {[65, 72, 68, 80, 75, 85, 90].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                  style={{ height: `${height}%`, width: '12px' }}
                ></div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Open Tickets</p>
                <p className="text-3xl font-bold text-gray-900">
                  {ticketsLoading ? '...' : Array.isArray(tickets) ? tickets.filter(t => !t.handled).length : 0}
                </p>
                <p className="text-xs text-red-600 mt-1">+3 new today</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <Ticket className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* Mini Chart */}
            <div className="h-16 flex items-end space-x-1">
              {[40, 35, 45, 30, 25, 20, 15].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-red-500 to-red-400 rounded-t"
                  style={{ height: `${height}%`, width: '12px' }}
                ></div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900">
                  {projectsLoading ? '...' : Array.isArray(projects) ? projects.length : 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">2 due this week</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* Mini Chart */}
            <div className="h-16 flex items-end space-x-1">
              {[55, 60, 65, 70, 75, 80, 85].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                  style={{ height: `${height}%`, width: '12px' }}
                ></div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">System Health</p>
                <p className="text-3xl font-bold text-green-600">99.9%</p>
                <p className="text-xs text-green-600 mt-1">All systems operational</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* Circular Progress */}
            <div className="h-16 flex items-center justify-center">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-green-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="99.9, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Employee Performance Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Performance Overview</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {Array.isArray(employees) && employees.length > 0 ? employees.slice(0, 6).map((employee, index) => {
                const rating = getOverallRating(employee);
                return (
                  <div key={employee.id || employee._id} className="flex flex-col items-center">
                    <div className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t mb-2" style={{ height: `${rating}%` }}></div>
                    <div className="text-xs text-gray-600 text-center">
                      {(employee.name || employee.firstName || 'E').charAt(0)}
                    </div>
                  </div>
                );
              }) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Project Status Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              {Array.isArray(projects) && projects.length > 0 ? (
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                    <circle
                      className="text-blue-500"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="40, 100"
                      strokeDashoffset="0"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                    <circle
                      className="text-green-500"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="30, 100"
                      strokeDashoffset="-40"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                    <circle
                      className="text-yellow-500"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="20, 100"
                      strokeDashoffset="-70"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
                      <div className="text-sm text-gray-600">Projects</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No projects available</div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
            <nav className="flex space-x-2">
              {[
                { id: 'employees', label: 'Employees', icon: Users, color: 'from-blue-500 to-blue-600' },
                { id: 'tickets', label: 'Tickets', icon: Ticket, color: 'from-red-500 to-red-600' },
                { id: 'projects', label: 'Projects', icon: FolderOpen, color: 'from-green-500 to-green-600' },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = view === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setView(tab.id)}
                    className={`group flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 mr-2 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Employees View */}
        {view === 'employees' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">IT Team Members</h2>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {Array.isArray(employees) ? employees.length : 0} employees
              </div>
            </div>

            {/* Debug Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
              <div className="text-sm text-yellow-700">
                <p><strong>Loading:</strong> {employeesLoading ? 'Yes' : 'No'}</p>
                <p><strong>Error:</strong> {employeesError || 'None'}</p>
                <p><strong>Employees Type:</strong> {typeof employees}</p>
                <p><strong>Is Array:</strong> {Array.isArray(employees) ? 'Yes' : 'No'}</p>
                <p><strong>Length:</strong> {employees?.length || 0}</p>
                <p><strong>Raw Data:</strong> {JSON.stringify(employees, null, 2)}</p>
              </div>
            </div>

            {employeesLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
            ) : employeesError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Error Loading Employees</h3>
                    <p className="text-red-600">{employeesError}</p>
                  </div>
                </div>
              </div>
            ) : Array.isArray(employees) && employees.length > 0 ? (
              <div className="grid gap-6">
                {employees.map((employee) => (
                  <div key={employee.id || employee._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">
                              {(employee.name || employee.firstName || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {employee.name || employee.firstName + ' ' + employee.lastName || 'Unknown Employee'}
                          </h3>
                          <p className="text-gray-600 mb-2">{employee.email || employee.position || 'IT Employee'}</p>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Code className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-600">Developer</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Monitor className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-600">Full Stack</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-4xl font-bold ${getRatingColor(getOverallRating(employee))}`}>
                          {getOverallRating(employee)}%
                        </div>
                        <div className="flex items-center justify-end mt-2 space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.floor(getOverallRating(employee) / 20)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Overall Rating</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Efficiency</label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={employee.efficiency || 0}
                            onChange={(e) => handleEfficiencyChange(employee.id || employee._id, parseInt(e.target.value))}
                            className="flex-1 h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                          />
                          <div className="w-16 text-center">
                            <span className="text-lg font-bold text-blue-600">{employee.efficiency || 0}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Performance</label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={employee.performance || 0}
                            onChange={(e) => handlePerformanceChange(employee.id || employee._id, parseInt(e.target.value))}
                            className="flex-1 h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                          />
                          <div className="w-16 text-center">
                            <span className="text-lg font-bold text-green-600">{employee.performance || 0}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Teamwork</label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={employee.teamwork || 0}
                            onChange={(e) => handleTeamworkChange(employee.id || employee._id, parseInt(e.target.value))}
                            className="flex-1 h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                          />
                          <div className="w-16 text-center">
                            <span className="text-lg font-bold text-purple-600">{employee.teamwork || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No employees found</h3>
                <p className="text-gray-500">No IT employees are currently registered in the system.</p>
              </div>
            )}
          </div>
        )}

        {/* Tickets View */}
        {view === 'tickets' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {Array.isArray(tickets) ? tickets.filter(t => !t.handled).length : 0} open tickets
              </div>
            </div>

            {ticketsLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
            ) : ticketsError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Error Loading Tickets</h3>
                    <p className="text-red-600">{ticketsError}</p>
                  </div>
                </div>
              </div>
            ) : Array.isArray(tickets) && tickets.length > 0 ? (
              <div className="grid gap-4">
                {tickets.map((ticket) => {
                  const priority = getTicketPriority(ticket.priority);
                  const PriorityIcon = priority.icon;
                  return (
                    <div key={ticket.id || ticket._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                          <div className={`w-4 h-4 rounded-full mt-2 ${ticket.handled ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {ticket.title || ticket.name || 'Untitled Ticket'}
                            </h3>
                            <p className="text-gray-600 mb-3">
                              Assigned to: {ticket.assignee || ticket.assignedTo || 'Unassigned'}
                            </p>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${priority.color}`}>
                                <PriorityIcon className="w-3 h-3 mr-1" />
                                {ticket.priority || 'medium'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                ticket.handled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {ticket.handled ? 'Resolved' : 'Open'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTicketStatusChange(ticket.id || ticket._id, !ticket.handled)}
                            className={`p-3 rounded-xl transition-all duration-200 ${
                              ticket.handled 
                                ? 'text-yellow-600 hover:bg-yellow-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={ticket.handled ? 'Reopen ticket' : 'Mark as resolved'}
                          >
                            {ticket.handled ? <Edit3 className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.id || ticket._id)}
                            className="p-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50"
                            title="Delete ticket"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-500">All support tickets have been resolved or no tickets exist.</p>
              </div>
            )}
          </div>
        )}

        {/* Projects View */}
        {view === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Active Projects</h2>
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Add Project</span>
              </button>
            </div>

            {projectsLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
            ) : projectsError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Error Loading Projects</h3>
                    <p className="text-red-600">{projectsError}</p>
                  </div>
                </div>
              </div>
            ) : Array.isArray(projects) && projects.length > 0 ? (
              <div className="grid gap-6">
                {projects.map((project) => {
                  const status = getProjectStatus(project.progress || project.completion || 0);
                  const StatusIcon = status.icon;
                  return (
                    <div key={project.id || project._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FolderOpen className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {project.name || project.title || 'Untitled Project'}
                            </h3>
                            <p className="text-gray-600 mb-3">{project.description || 'No description'}</p>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Database className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-600">Backend</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Cloud className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600">Cloud</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${status.color}`}>
                            <StatusIcon className="w-4 h-4 mr-2" />
                            {status.text}
                          </span>
                          <button
                            onClick={() => handleDeleteProject(project.id || project._id)}
                            className={`p-3 rounded-xl transition-all duration-200 ${
                              canDelete(user) 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={canDelete(user) ? "Delete project" : "Permission denied"}
                            disabled={!canDelete(user)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-semibold text-gray-700">Progress</span>
                          <span className="text-lg font-bold text-gray-900">{project.progress || project.completion || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${project.progress || project.completion || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                          <label className="text-sm font-semibold text-gray-700">Update Progress:</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={project.progress || project.completion || 0}
                            onChange={(e) => handleProjectProgressChange(project.id || project._id, parseInt(e.target.value))}
                            className="w-40 h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                          />
                          <span className="text-sm font-bold text-blue-600 w-12 text-center">{project.progress || project.completion || 0}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FolderOpen className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-500">Create your first project to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Add Project Modal */}
        {showAddProjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-96 max-w-full mx-4 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Project</h3>
              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <textarea
                  placeholder="Project Description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-semibold text-gray-700">Initial Progress:</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newProjectProgress}
                    onChange={(e) => setNewProjectProgress(parseInt(e.target.value))}
                    className="flex-1 h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm font-bold text-blue-600 w-12 text-center">{newProjectProgress}%</span>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProject}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 shadow-lg ${
                    canCreateProjects(user)
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  disabled={!canCreateProjects(user)}
                  title={canCreateProjects(user) ? "Add new project" : "Permission denied - Admin only"}
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1c242e, #334155);
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
            transition: all 0.2s ease;
          }
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
          }
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1c242e, #334155);
            cursor: pointer;
            border: none;
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
            transition: all 0.2s ease;
          }
          .slider::-moz-range-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
          }
        `}</style>
      </div>
    </div>
  );
};

export default ITDepartment;