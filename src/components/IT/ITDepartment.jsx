import { useEffect, useState } from 'react';
import { UserPlus, FolderPlus } from 'lucide-react';

const ITDepartment = () => {
  // Employees
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice', efficiency: 70, performance: 60, teamwork: 65, notes: [] },
    { id: 2, name: 'Bob', efficiency: 80, performance: 75, teamwork: 70, notes: [] },
  ]);

  // Projects
  const [projects, setProjects] = useState([
    { id: 1, name: 'Website Redesign', description: 'Refresh company website UI', ownerId: 1, progress: 35, notes: [] },
    { id: 2, name: 'CRM Upgrade', description: 'Upgrade CRM platform', ownerId: 2, progress: 70, notes: [] },
  ]);

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // New user form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserEfficiency, setNewUserEfficiency] = useState(0);
  const [newUserPerformance, setNewUserPerformance] = useState(0);
  const [newUserTeamwork, setNewUserTeamwork] = useState(0);

  // New project form
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectOwnerId, setNewProjectOwnerId] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectProgress, setNewProjectProgress] = useState(0);

  // Per-project new note input values
  const [newNotes, setNewNotes] = useState({});
  // Per-employee note input values
  const [newEmployeeNotes, setNewEmployeeNotes] = useState({});

  // Tickets
  const [tickets, setTickets] = useState([
    { id: 1, title: 'Reset password for HR', handled: false },
    { id: 2, title: 'VPN access for Alice', handled: true },
  ]);
  const [newTicketTitle, setNewTicketTitle] = useState('');

  // View toggle: 'employees' | 'projects' | 'tickets'
  const [view, setView] = useState('employees');

  // Load initial data (API-ready)
  useEffect(() => {
    (async () => {
      try {
        const [u, p] = await Promise.all([getEmployees(), getProjects()]);
        const normalizedUsers = (u || []).map(user => ({
          ...user,
          efficiency: typeof user.efficiency === 'number' ? user.efficiency : 0,
          performance: typeof user.performance === 'number' ? user.performance : 0,
          teamwork: typeof user.teamwork === 'number' ? user.teamwork : 0,
          notes: Array.isArray(user.notes) ? user.notes : [],
        }));
        setUsers(normalizedUsers);
        const normalizedProjects = (p || []).map(pr => ({ ...pr, notes: pr.notes || [] }));
        setProjects(normalizedProjects);
      } catch (e) {
        console.error('Failed to load IT Department data', e);
      }
    })();
  }, []);

  // Employee actions
  const addUser = async () => {
    if (!newUserName.trim()) return;
    try {
      const created = await addEmployee({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        efficiency: newUserEfficiency,
        performance: newUserPerformance,
        teamwork: newUserTeamwork,
        notes: [],
      });
      const next = [...users, created];
      setUsers(next);
      await saveEmployees(next);
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserEfficiency(0);
      setNewUserPerformance(0);
      setNewUserTeamwork(0);
    } catch (e) {
      console.error('Failed to add user', e);
    }
  };

  const handleEfficiencyChange = async (id, efficiency) => {
    try {
      const next = users.map(u => (u.id === id ? { ...u, efficiency } : u));
      setUsers(next);
      await updateEmployeeEfficiency(id, efficiency);
    } catch (e) {
      console.error('Failed to update efficiency', e);
    }
  };

  const handlePerformanceChange = async (id, performance) => {
    try {
      const next = users.map(u => (u.id === id ? { ...u, performance } : u));
      setUsers(next);
      await updateEmployeePerformance(id, performance);
    } catch (e) {
      console.error('Failed to update performance', e);
    }
  };

  const handleTeamworkChange = async (id, teamwork) => {
    try {
      const next = users.map(u => (u.id === id ? { ...u, teamwork } : u));
      setUsers(next);
      await updateEmployeeTeamwork(id, teamwork);
    } catch (e) {
      console.error('Failed to update teamwork', e);
    }
  };

  const handleAddEmployeeNote = async (userId) => {
    const text = (newEmployeeNotes[userId] || '').trim();
    if (!text) return;
    const next = users.map(u =>
      u.id === userId ? { ...u, notes: [...(u.notes || []), text] } : u
    );
    setUsers(next);
    setNewEmployeeNotes({ ...newEmployeeNotes, [userId]: '' });
    try {
      await saveEmployees(next);
    } catch (e) {
      console.error('Failed to save employee notes', e);
    }
  };

  // Project actions
  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const created = await addProject({
        name: newProjectName.trim(),
        ownerId: newProjectOwnerId ? Number(newProjectOwnerId) : null,
        description: newProjectDescription.trim(),
        progress: 0,
      });
      // Ensure notes array exists
      created.notes = created.notes || [];
      setProjects(prev => [...prev, created]);
      setShowAddProjectModal(false);
      setNewProjectName('');
      setNewProjectOwnerId('');
      setNewProjectDescription('');
      setNewProjectProgress(0);
    } catch (e) {
      console.error('Failed to add project', e);
    }
  };

  const handleProgressChange = async (id, progress) => {
    const next = projects.map(p => (p.id === id ? { ...p, progress } : p));
    setProjects(next);
    try {
      await updateProjectProgress(id, progress);
    } catch (e) {
      console.error('Failed to update progress', e);
    }
  };

  const handleDescriptionChange = async (id, description) => {
    const next = projects.map(p => (p.id === id ? { ...p, description } : p));
    setProjects(next);
    try {
      await saveProjects(next);
    } catch (e) {
      console.error('Failed to save description', e);
    }
  };

  const handleAddNote = async (projectId) => {
    const text = (newNotes[projectId] || '').trim();
    if (!text) return;
    const next = projects.map(p =>
      p.id === projectId ? { ...p, notes: [...(p.notes || []), text] } : p
    );
    setProjects(next);
    setNewNotes({ ...newNotes, [projectId]: '' });
    try {
      await saveProjects(next);
    } catch (e) {
      console.error('Failed to save notes', e);
    }
  };

  // Ticket actions
  const addTicket = () => {
    const t = newTicketTitle.trim();
    if (!t) return;
    setTickets(prev => [...prev, { id: Date.now(), title: t, handled: false }]);
    setNewTicketTitle('');
  };

  const setTicketHandled = (id, handled) => {
    setTickets(prev => prev.map(t => (t.id === id ? { ...t, handled } : t)));
  };

  const ownerName = (ownerId) => {
    if (!ownerId) return 'Unassigned';
    const u = users.find(x => x.id === ownerId);
    return u ? u.name : 'Unknown';
  };

  return (
    <div className="department-container">
      {/* Header */}
      <div className="department-header">
        <h1>Information Technology</h1>
        <p>Manage technology infrastructure, systems, and digital tools</p>
      </div>

      {/* Stats */}
      <div className="department-stats">
        <div className="stat-card">
          <h3>Team Members</h3>
          <p className="stat-number">{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Projects</h3>
          <p className="stat-number">{projects.length}</p>
        </div>
        <div className="stat-card">
          <h3>This Month's Goals</h3>
          <p className="stat-number">85%</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="department-actions">
        <button onClick={() => setShowAddUserModal(true)} className="action-button">
          <UserPlus /> Add User
        </button>
        <button onClick={() => setShowAddProjectModal(true)} className="action-button">
          <FolderPlus /> Add Project
        </button>
      </div>

      {/* View Toggle */}
      <div className="view-toggle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '0.75rem 0.5rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', width: 300, height: 36 }}>
          {/* Track */}
          <span
            style={{ position: 'absolute', inset: 0, background: '#f1f5f9', border: '1px solid #e5e7eb', borderRadius: 9999 }}
          />
          {/* Sliding pill */}
          <span
            style={{ position: 'absolute', top: 3, left: 3, width: 'calc(33.333% - 6px)', height: 30, background: 'linear-gradient(135deg, #1c242e 0%, #334155 100%)', borderRadius: 9999, transition: 'transform 0.2s ease', transform: view === 'employees' ? 'translateX(0)' : (view === 'projects' ? 'translateX(100%)' : 'translateX(200%)') }}
          />
          {/* Labels inside */}
          <span
            style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', justifyItems: 'center', padding: '0 12px', fontWeight: 700, fontSize: 12, zIndex: 3 }}
          >
            <span onClick={(e) => { e.stopPropagation(); setView('employees'); }} style={{ cursor: 'pointer', color: view === 'employees' ? '#ffffff' : '#334155', userSelect: 'none' }}>Employees</span>
            <span onClick={(e) => { e.stopPropagation(); setView('projects'); }} style={{ cursor: 'pointer', color: view === 'projects' ? '#ffffff' : '#334155', userSelect: 'none' }}>Projects</span>
            <span onClick={(e) => { e.stopPropagation(); setView('tickets'); }} style={{ cursor: 'pointer', color: view === 'tickets' ? '#ffffff' : '#334155', userSelect: 'none' }}>Tickets</span>
          </span>
        </div>
      </div>

      {/* Users List */}
      {view === 'employees' && (
      <div className="user-list" style={{ marginBottom: '1.5rem' }}>
        <h2>Team Members</h2>
        {users.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-card-inner">
              <div className="user-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="user-name">{user.name}</span>
              </div>

              {/* Efficiency */}
              <div className="user-efficiency" style={{ marginTop: '0.75rem' }}>
                <label className="field-label">Efficiency</label>
                <div className="progress-bar">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${user.efficiency || 0}%` }}
                    />
                  </div>
                  <span className="progress-label">{user.efficiency || 0}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={user.efficiency || 0}
                  onChange={(e) => handleEfficiencyChange(user.id, Number(e.target.value))}
                  style={{ width: '220px' }}
                />
              </div>

              {/* Performance */}
              <div className="user-performance" style={{ marginTop: '0.75rem' }}>
                <label className="field-label">Performance</label>
                <div className="progress-bar">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${user.performance || 0}%`, background: 'linear-gradient(90deg, #10b981, #059669)' }}
                    />
                  </div>
                  <span className="progress-label">{user.performance || 0}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={user.performance || 0}
                  onChange={(e) => handlePerformanceChange(user.id, Number(e.target.value))}
                  style={{ width: '220px' }}
                />
              </div>

              {/* Teamwork */}
              <div className="user-teamwork" style={{ marginTop: '0.75rem' }}>
                <label className="field-label">Teamwork</label>
                <div className="progress-bar">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${user.teamwork || 0}%`, background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}
                    />
                  </div>
                  <span className="progress-label">{user.teamwork || 0}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={user.teamwork || 0}
                  onChange={(e) => handleTeamworkChange(user.id, Number(e.target.value))}
                  style={{ width: '220px' }}
                />
              </div>

              {/* Notes */}
              <div className="notes" style={{ marginTop: '0.75rem' }}>
                <label className="field-label">Notes</label>
                <div className="notes-list">
                  {(user.notes || []).length === 0 && (
                    <div className="note-item empty">No notes yet.</div>
                  )}
                  {(user.notes || []).map((note, idx) => (
                    <div key={idx} className="note-item">{note}</div>
                  ))}
                </div>
                <div className="add-note">
                  <input
                    type="text"
                    placeholder="Add a note"
                    value={newEmployeeNotes[user.id] || ''}
                    onChange={(e) => setNewEmployeeNotes({ ...newEmployeeNotes, [user.id]: e.target.value })}
                  />
                  <button className="action-button" onClick={() => handleAddEmployeeNote(user.id)}>
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      )}

      {/* Projects List */}
      {view === 'projects' && (
      <div className="project-list">
        <h2>Projects</h2>
        {projects.map(project => (
          <div className="project-card" key={project.id}>
            <div className="project-header">
              <div>
                <div className="project-name">{project.name}</div>
                <div className="project-meta">Owner: {ownerName(project.ownerId)}</div>
              </div>
              <div className="project-progress">
                <div className="progress-bar">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                  <span className="progress-label">{project.progress || 0}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={project.progress || 0}
                  onChange={(e) => handleProgressChange(project.id, Number(e.target.value))}
                />
              </div>
            </div>

            <div className="project-body">
              <label className="field-label">Description</label>
              <textarea
                className="project-description"
                placeholder="Project description..."
                value={project.description || ''}
                onChange={(e) => handleDescriptionChange(project.id, e.target.value)}
              />

              <div className="notes">
                <label className="field-label">Notes</label>
                <div className="notes-list">
                  {(project.notes || []).length === 0 && (
                    <div className="note-item empty">No notes yet.</div>
                  )}
                  {(project.notes || []).map((note, idx) => (
                    <div key={idx} className="note-item">{note}</div>
                  ))}
                </div>
                <div className="add-note">
                  <input
                    type="text"
                    placeholder="Add a note"
                    value={newNotes[project.id] || ''}
                    onChange={(e) => setNewNotes({ ...newNotes, [project.id]: e.target.value })}
                  />
                  <button className="action-button" onClick={() => handleAddNote(project.id)}>
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      )}

      {/* Tickets List */}
      {view === 'tickets' && (
        <div className="project-list">
          <h2>Tickets</h2>
          <div className="add-note" style={{ margin: '0 1.25rem 1rem 1.25rem' }}>
            <input
              type="text"
              placeholder="Add a ticket"
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.target.value)}
            />
            <button className="action-button" onClick={addTicket}>Add Ticket</button>
          </div>
          {tickets.map(ticket => (
            <div key={ticket.id} className="project-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="project-name">{ticket.title}</div>
              <select
                value={ticket.handled ? 'handled' : 'pending'}
                onChange={(e) => setTicketHandled(ticket.id, e.target.value === 'handled')}
                style={{ padding: '0.5rem',marginBottom:'1rem', borderRadius: 8, border: '1px solid #e5e7eb' }}
              >
                <option value="pending">Pending</option>
                <option value="handled">Handled</option>
              </select>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="project-card"><div className="note-item empty">No tickets yet.</div></div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New User</h3>
            <input
              type="text"
              placeholder="User Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
            />
            <p style={{ fontSize: 12, color: '#64748b' }}>
              An auto-generated password will be sent to this email.
            </p>
            <div className="modal-buttons">
              <button className="action-button" onClick={addUser}>Add</button>
              <button className="action-button cancel" onClick={() => setShowAddUserModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Project</h3>
            <input
              type="text"
              placeholder="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />

            <select
              value={newProjectOwnerId}
              onChange={(e) => setNewProjectOwnerId(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 5, border: '1px solid #ccc' }}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            <textarea
              placeholder="Project Description"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              style={{ minHeight: 80, padding: '0.5rem', borderRadius: 5, border: '1px solid #ccc' }}
            />

            <div className="modal-buttons">
              <button className="action-button" onClick={handleAddProject}>Add</button>
              <button className="action-button cancel" onClick={() => setShowAddProjectModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ITDepartment;
