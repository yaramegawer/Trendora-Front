import { useState } from 'react';
import { 
  Users, 
  Megaphone, 
  Plus, 
  Star, 
  Clock, 
  CheckCircle, 
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
  PieChart
} from 'lucide-react';
import { useOperationEmployees, useOperationCampaigns } from '../../hooks/useOperationData';
import { useAuth } from '../../contexts/AuthContext';
import { canAdd, canEdit, canDelete, showPermissionError } from '../../utils/permissions';

const OperationDepartment = () => {
  // Use real API data
  const { employees, loading: employeesLoading, error: employeesError, updateEmployeeRating } = useOperationEmployees();
  const { campaigns, loading: campaignsLoading, error: campaignsError, createCampaign, updateCampaign, deleteCampaign } = useOperationCampaigns();
  const { user } = useAuth();

  // Modals
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);

  // New campaign form
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');
  const [newCampaignBudget, setNewCampaignBudget] = useState('');
  const [newCampaignStartDate, setNewCampaignStartDate] = useState('');
  const [newCampaignEndDate, setNewCampaignEndDate] = useState('');

  // View toggle: 'employees' | 'campaigns'
  const [view, setView] = useState('employees');

  // Employee actions
  const handleEfficiencyChange = async (id, efficiency) => {
    if (!canEdit(user)) {
      showPermissionError('update employee ratings', user);
      return;
    }
    
    try {
      await updateEmployeeRating(id, { efficiency });
    } catch (e) {
      console.error('Failed to update efficiency', e);
    }
  };

  const handlePerformanceChange = async (id, performance) => {
    if (!canEdit(user)) {
      showPermissionError('update employee ratings', user);
      return;
    }
    
    try {
      await updateEmployeeRating(id, { performance });
    } catch (e) {
      console.error('Failed to update performance', e);
    }
  };

  const handleTeamworkChange = async (id, teamwork) => {
    if (!canEdit(user)) {
      showPermissionError('update employee ratings', user);
      return;
    }
    
    try {
      await updateEmployeeRating(id, { teamwork });
    } catch (e) {
      console.error('Failed to update teamwork', e);
    }
  };

  // Campaign actions
  const handleAddCampaign = async () => {
    if (!canAdd(user)) {
      showPermissionError('add campaigns', user);
      return;
    }
    
    if (!newCampaignName.trim()) return;
    try {
      await createCampaign({
        name: newCampaignName.trim(),
        description: newCampaignDescription.trim(),
        budget: parseFloat(newCampaignBudget) || 0,
        startDate: newCampaignStartDate,
        endDate: newCampaignEndDate,
      });
      setShowAddCampaignModal(false);
      setNewCampaignName('');
      setNewCampaignDescription('');
      setNewCampaignBudget('');
      setNewCampaignStartDate('');
      setNewCampaignEndDate('');
    } catch (e) {
      console.error('Failed to add campaign', e);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!canDelete(user)) {
      showPermissionError('delete campaigns', user);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id);
      } catch (e) {
        console.error('Failed to delete campaign', e);
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

  const getCampaignStatus = (campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    if (now < startDate) return { text: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Clock };
    if (now > endDate) return { text: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    return { text: 'Active', color: 'bg-yellow-100 text-yellow-800', icon: TrendingUp };
  };

  const getCampaignProgress = (campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    if (now < startDate) return 0;
    if (now > endDate) return 100;
    
    const totalDuration = endDate - startDate;
    const elapsed = now - startDate;
    return Math.min(Math.round((elapsed / totalDuration) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Operations Department
              </h1>
              <p className="text-gray-600 mt-1">Manage employees and marketing campaigns</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Operations Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Enhanced Stats Cards with Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">
                  {employeesLoading ? '...' : Array.isArray(employees) ? employees.length : 0}
                </p>
                <p className="text-xs text-green-600 mt-1">+8% from last month</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* Mini Chart */}
            <div className="h-16 flex items-end space-x-1">
              {[70, 75, 68, 82, 78, 85, 88].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t"
                  style={{ height: `${height}%`, width: '12px' }}
                ></div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">
                  {campaignsLoading ? '...' : Array.isArray(campaigns) ? campaigns.length : 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">3 launching this week</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* Mini Chart */}
            <div className="h-16 flex items-end space-x-1">
              {[45, 50, 55, 60, 65, 70, 75].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-t"
                  style={{ height: `${height}%`, width: '12px' }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Employee Performance Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance Overview</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {Array.isArray(employees) && employees.length > 0 ? employees.slice(0, 6).map((employee, index) => {
                const rating = getOverallRating(employee);
                return (
                  <div key={employee.id || employee._id} className="flex flex-col items-center">
                    <div className="w-8 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t mb-2" style={{ height: `${rating}%` }}></div>
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

          {/* Campaign Budget Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Budget Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              {Array.isArray(campaigns) && campaigns.length > 0 ? (
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
                      className="text-purple-500"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="50, 100"
                      strokeDashoffset="0"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                    <circle
                      className="text-pink-500"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="30, 100"
                      strokeDashoffset="-50"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                    <circle
                      className="text-orange-500"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="20, 100"
                      strokeDashoffset="-80"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{campaigns.length}</div>
                      <div className="text-sm text-gray-600">Campaigns</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No campaigns available</div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Visual Elements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-32 flex items-end space-x-1">
              {[40, 45, 50, 55, 60, 65, 70, 75, 80, 85].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-green-500 to-green-400 rounded-t flex-1"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>Jan</span>
              <span>Dec</span>
            </div>
          </div>

          {/* Efficiency Meter */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Efficiency</h3>
            <div className="h-32 flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-orange-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="85, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-orange-600">85%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Success Rate */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Success Rate</h3>
            <div className="h-32 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">92%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
            <nav className="flex space-x-2">
              {[
                { id: 'employees', label: 'Employees', icon: Users, color: 'from-orange-500 to-red-600' },
                { id: 'campaigns', label: 'Campaigns', icon: Megaphone, color: 'from-purple-500 to-pink-600' },
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
              <h2 className="text-2xl font-bold text-gray-900">Operation Team Members</h2>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {Array.isArray(employees) ? employees.length : 0} employees
              </div>
            </div>

            {employeesLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
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
                          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
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
                          <p className="text-gray-600 mb-2">{employee.email || employee.position || 'Operation Employee'}</p>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Briefcase className="w-4 h-4 text-orange-500" />
                              <span className="text-sm text-gray-600">Operations</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <BarChart3 className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-600">Analyst</span>
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
                            className={`flex-1 h-3 bg-gray-200 rounded-full appearance-none ${
                              canEdit(user) ? 'cursor-pointer slider' : 'cursor-not-allowed opacity-50'
                            }`}
                            disabled={!canEdit(user)}
                          />
                          <div className="w-16 text-center">
                            <span className="text-lg font-bold text-orange-600">{employee.efficiency || 0}%</span>
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
                            className={`flex-1 h-3 bg-gray-200 rounded-full appearance-none ${
                              canEdit(user) ? 'cursor-pointer slider' : 'cursor-not-allowed opacity-50'
                            }`}
                            disabled={!canEdit(user)}
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
                            className={`flex-1 h-3 bg-gray-200 rounded-full appearance-none ${
                              canEdit(user) ? 'cursor-pointer slider' : 'cursor-not-allowed opacity-50'
                            }`}
                            disabled={!canEdit(user)}
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
                <p className="text-gray-500">No Operation employees are currently registered in the system.</p>
              </div>
            )}
          </div>
        )}

        {/* Campaigns View */}
        {view === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Marketing Campaigns</h2>
              <button
                onClick={() => setShowAddCampaignModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Add Campaign</span>
              </button>
            </div>

            {campaignsLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
              </div>
            ) : campaignsError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Error Loading Campaigns</h3>
                    <p className="text-red-600">{campaignsError}</p>
                  </div>
                </div>
              </div>
            ) : Array.isArray(campaigns) && campaigns.length > 0 ? (
              <div className="grid gap-6">
                {campaigns.map((campaign) => {
                  const status = getCampaignStatus(campaign);
                  const progress = getCampaignProgress(campaign);
                  const StatusIcon = status.icon;
                  return (
                    <div key={campaign.id || campaign._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Megaphone className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {campaign.name || campaign.title || 'Untitled Campaign'}
                            </h3>
                            <p className="text-gray-600 mb-3">{campaign.description || 'No description'}</p>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Globe className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-600">Digital</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600">Marketing</span>
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
                            onClick={() => handleDeleteCampaign(campaign.id || campaign._id)}
                            className={`p-3 rounded-xl transition-all duration-200 ${
                              canDelete(user) 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={canDelete(user) ? "Delete campaign" : "Permission denied"}
                            disabled={!canDelete(user)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                          <DollarSign className="w-5 h-5 text-green-500" />
                          <div>
                            <span className="text-sm text-gray-600">Budget</span>
                            <p className="text-lg font-bold text-gray-900">${campaign.budget?.toLocaleString() || '0'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          <div>
                            <span className="text-sm text-gray-600">Start Date</span>
                            <p className="text-lg font-bold text-gray-900">{campaign.startDate || 'Not set'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                          <Calendar className="w-5 h-5 text-purple-500" />
                          <div>
                            <span className="text-sm text-gray-600">End Date</span>
                            <p className="text-lg font-bold text-gray-900">{campaign.endDate || 'Not set'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-semibold text-gray-700">Campaign Progress</span>
                          <span className="text-lg font-bold text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Megaphone className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-500">Create your first marketing campaign to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Add Campaign Modal */}
        {showAddCampaignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-96 max-w-full mx-4 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Campaign</h3>
              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Campaign Name"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                <textarea
                  placeholder="Campaign Description"
                  value={newCampaignDescription}
                  onChange={(e) => setNewCampaignDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl h-24 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                <input
                  type="number"
                  placeholder="Budget ($)"
                  value={newCampaignBudget}
                  onChange={(e) => setNewCampaignBudget(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={newCampaignStartDate}
                    onChange={(e) => setNewCampaignStartDate(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={newCampaignEndDate}
                    onChange={(e) => setNewCampaignEndDate(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowAddCampaignModal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCampaign}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 shadow-lg ${
                    canAdd(user)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-xl'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  disabled={!canAdd(user)}
                  title={canAdd(user) ? "Add new campaign" : "Permission denied"}
                >
                  Create Campaign
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
            background: linear-gradient(135deg, #f97316, #dc2626);
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(249, 115, 22, 0.3);
            transition: all 0.2s ease;
          }
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 12px rgba(249, 115, 22, 0.4);
          }
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f97316, #dc2626);
            cursor: pointer;
            border: none;
            box-shadow: 0 4px 8px rgba(249, 115, 22, 0.3);
            transition: all 0.2s ease;
          }
          .slider::-moz-range-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 12px rgba(249, 115, 22, 0.4);
          }
        `}</style>
      </div>
    </div>
  );
};

export default OperationDepartment;