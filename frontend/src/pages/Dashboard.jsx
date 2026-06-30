import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offered', 'Rejected'];
const STAGE_COLORS = {
    Applied: 'applied',
    Screening: 'screening',
    Interview: 'interview',
    Offered: 'offered',
    Rejected: 'rejected',
};

const Avatar = ({ name }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';
    const hue = name ? (name.charCodeAt(0) * 37 + name.charCodeAt(1 % name.length) * 13) % 360 : 200;
    return (
        <div className="candidate-avatar" style={{ '--hue': hue }}>
            {initials}
        </div>
    );
};

const PipelineBar = ({ candidates }) => {
    const total = candidates.length || 1;
    const stages = ['Applied', 'Screening', 'Interview', 'Offered'];
    return (
        <div className="pipeline-bar-wrap">
            <div className="pipeline-bar-label">Pipeline Overview</div>
            <div className="pipeline-bar">
                {stages.map(s => {
                    const count = candidates.filter(c => c.status === s).length;
                    const pct = (count / total) * 100;
                    return pct > 0 ? (
                        <div
                            key={s}
                            className={`pipeline-segment pipeline-${s.toLowerCase()}`}
                            style={{ width: `${pct}%` }}
                            title={`${s}: ${count}`}
                        />
                    ) : null;
                })}
            </div>
            <div className="pipeline-legend">
                {stages.map(s => (
                    <span key={s} className="pipeline-legend-item">
                        <span className={`legend-dot pipeline-dot-${s.toLowerCase()}`} />
                        {s}
                    </span>
                ))}
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
// CandidateForm MUST live outside Dashboard so React doesn't
// treat it as a new component type on every state update (which
// caused inputs to unmount/remount and blink on each keystroke).
// ──────────────────────────────────────────────────────────────
const CandidateForm = ({ data, setData, onSubmit, onCancel, title, submitLabel }) => (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
        <div className="modal-content modal-large">
            <div className="modal-header">
                <h3>{title}</h3>
                <button className="btn-close" onClick={onCancel}>×</button>
            </div>
            <form onSubmit={onSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input type="text" placeholder="e.g. Alex Johnson" value={data.name}
                            onChange={e => setData({ ...data, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Email Address *</label>
                        <input type="email" placeholder="alex@company.com" value={data.email}
                            onChange={e => setData({ ...data, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="tel" placeholder="+91 98765 43210" value={data.phone || ''}
                            onChange={e => setData({ ...data, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" placeholder="e.g. Bengaluru, India" value={data.location || ''}
                            onChange={e => setData({ ...data, location: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Target Role / Position *</label>
                        <input type="text" placeholder="e.g. Senior Frontend Engineer" value={data.role}
                            onChange={e => setData({ ...data, role: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Years of Experience</label>
                        <input type="number" min="0" max="50" value={data.experience}
                            onChange={e => setData({ ...data, experience: Number(e.target.value) })} />
                    </div>
                    <div className="form-group">
                        <label>Source</label>
                        <select value={data.source || 'LinkedIn'} onChange={e => setData({ ...data, source: e.target.value })}>
                            {['LinkedIn', 'Naukri', 'Referral', 'Company Website', 'GitHub', 'Internshala', 'Other'].map(s => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Priority</label>
                        <select value={data.priority || 'Normal'} onChange={e => setData({ ...data, priority: e.target.value })}>
                            {['Low', 'Normal', 'High', 'Urgent'].map(p => (
                                <option key={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Recruitment Stage</label>
                        <select value={data.status} onChange={e => setData({ ...data, status: e.target.value })}>
                            {STAGES.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Notes / Remarks</label>
                        <input type="text" placeholder="Any notes about this candidate..."
                            value={data.notes || ''}
                            onChange={e => setData({ ...data, notes: e.target.value })} />
                    </div>


                </div>
                <div className="modal-footer">
                    <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="primary">{submitLabel}</button>
                </div>
            </form>
        </div>
    </div>
);


const Dashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [viewCandidate, setViewCandidate] = useState(null);

    const emptyForm = {
        name: '', email: '', role: '', phone: '',
        location: '', status: 'Applied', experience: 0,
        source: 'LinkedIn', priority: 'Normal', notes: '',
    };

    const [newCandidate, setNewCandidate] = useState(emptyForm);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [alert, setAlert] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [activeTab, setActiveTab] = useState('table'); // 'table' | 'kanban'

    const navigate = useNavigate();

    useEffect(() => {
        const savedName = localStorage.getItem('userName');
        if (savedName) setUserName(savedName);
        fetchCandidates();
    }, [search, statusFilter]);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
            const res = await API.get('/candidates', { params });
            setCandidates(res.data.data);
        } catch (error) {
            if (error.response?.status === 401) handleLogout();
            else showAlert('danger', 'Failed to retrieve candidates.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/auth');
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: '', message: '' }), 4000);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/candidates', newCandidate);
            setShowAddModal(false);
            setNewCandidate(emptyForm);
            showAlert('success', 'Candidate profile created successfully.');
            fetchCandidates();
        } catch (error) {
            showAlert('danger', error.response?.data?.message || 'Error adding candidate.');
        }
    };

    const openEditModal = (candidate) => {
        setSelectedCandidate({ ...candidate });
        setShowEditModal(true);
    };

    const openViewModal = (candidate) => {
        setViewCandidate(candidate);
        setShowViewModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/candidates/${selectedCandidate._id}`, selectedCandidate);
            setShowEditModal(false);
            setSelectedCandidate(null);
            showAlert('success', 'Candidate updated successfully.');
            fetchCandidates();
        } catch (error) {
            showAlert('danger', error.response?.data?.message || 'Error updating candidate.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this candidate? This cannot be undone.')) {
            try {
                await API.delete(`/candidates/${id}`);
                showAlert('success', 'Candidate removed from pipeline.');
                fetchCandidates();
            } catch {
                showAlert('danger', 'Failed to delete candidate.');
            }
        }
    };

    const stats = {
        total: candidates.length,
        applied: candidates.filter(c => c.status === 'Applied').length,
        screening: candidates.filter(c => c.status === 'Screening').length,
        interview: candidates.filter(c => c.status === 'Interview').length,
        offered: candidates.filter(c => c.status === 'Offered').length,
        rejected: candidates.filter(c => c.status === 'Rejected').length,
        hiringRate: candidates.length
            ? Math.round((candidates.filter(c => c.status === 'Offered').length / candidates.length) * 100)
            : 0,
    };

    const statCards = [
        { label: 'Total Pipeline', value: stats.total, icon: '👥', cls: 'icon-total', trend: null },
        { label: 'Applied', value: stats.applied, icon: '📝', cls: 'icon-applied', trend: null },
        { label: 'Interviewing', value: stats.interview, icon: '🗣️', cls: 'icon-interview', trend: null },
        { label: 'Offered', value: stats.offered, icon: '🎉', cls: 'icon-offered', trend: null },
        { label: 'Hire Rate', value: `${stats.hiringRate}%`, icon: '📈', cls: 'icon-rate', trend: null },
        { label: 'Rejected', value: stats.rejected, icon: '❌', cls: 'icon-rejected', trend: null },
    ];

    return (
        <div className="app-container">
            {/* Navbar */}
            <nav className="dashboard-nav">
                <div className="brand">
                    <div className="brand-logo">
                        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                            <path d="M24 8C15.16 8 8 15.16 8 24s7.16 16 16 16 16-7.16 16-16S32.84 8 24 8zm0 6a6 6 0 110 12 6 6 0 010-12zm0 22.4a11.6 11.6 0 01-8.93-4.2C15.26 30.14 19.48 28.8 24 28.8c4.52 0 8.74 1.34 8.93 3.4A11.6 11.6 0 0124 36.4z" fill="white" />
                        </svg>
                    </div>
                    <div>
                        <span className="brand-name">TalentCRM</span>
                        <span className="brand-tagline">ATS Dashboard</span>
                    </div>
                </div>
                <div className="nav-center">
                    <div className="nav-tabs">
                        <button className={`nav-tab ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>
                            📋 Table View
                        </button>
                        <button className={`nav-tab ${activeTab === 'kanban' ? 'active' : ''}`} onClick={() => setActiveTab('kanban')}>
                            📌 Kanban
                        </button>
                    </div>
                </div>
                <div className="user-profile">
                    <div className="user-badge" style={{ marginRight: '16px' }}>
                        <div className="user-avatar-mini">{userName ? userName[0].toUpperCase() : 'U'}</div>
                        <span className="user-name">Hello, <strong>{userName || 'User'}</strong></span>
                    </div>
                    <button className="secondary" onClick={() => setShowContactModal(true)} style={{ padding: '8px 16px', fontSize: '0.85rem', marginRight: '8px' }}>
                        ✉️ Contact
                    </button>
                    <button className="secondary" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        🚪 Sign Out
                    </button>
                </div>
            </nav>

            <main className="dashboard-main">
                {/* Alert */}
                {alert.message && (
                    <div className={`alert alert-${alert.type}`} style={{ maxWidth: '640px', margin: '0 auto 24px auto' }}>
                        {alert.type === 'danger' ? '⚠️' : '✅'} {alert.message}
                    </div>
                )}

                {/* Stats Row */}
                <section className="stats-row">
                    {statCards.map((card, i) => (
                        <div className="stat-card" key={i} style={{ animationDelay: `${i * 60}ms` }}>
                            <div className={`stat-icon ${card.cls}`}>{card.icon}</div>
                            <div className="stat-info">
                                <span className="stat-label">{card.label}</span>
                                <span className="stat-value">{card.value}</span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Pipeline Bar */}
                {candidates.length > 0 && <PipelineBar candidates={candidates} />}

                {/* Actions Bar */}
                <div className="dashboard-actions-header">
                    <div className="controls-group">
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                placeholder="Search by name, role, or location..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="All">All Stages</option>
                            {STAGES.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <button className="primary" onClick={() => setShowAddModal(true)}>
                        ➕ Add Candidate
                    </button>
                </div>

                {/* Table View */}
                {activeTab === 'table' && (
                    <div className="candidates-card">
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Contact</th>
                                        <th>Role</th>
                                        <th>Source</th>
                                        <th>Exp.</th>
                                        <th>Priority</th>
                                        <th>Stage</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && candidates.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                                <div className="loading-spinner" />
                                            </td>
                                        </tr>
                                    ) : candidates.length === 0 ? (
                                        <tr>
                                            <td colSpan="8">
                                                <div className="empty-state">
                                                    <div className="empty-icon">📂</div>
                                                    <h3>No candidates yet</h3>
                                                    <p>Add your first candidate to start tracking the pipeline.</p>
                                                    <button className="primary" onClick={() => setShowAddModal(true)} style={{ marginTop: '16px' }}>
                                                        ➕ Add Candidate
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : candidates.map(c => (
                                        <tr key={c._id} className="table-row-animated">
                                            <td>
                                                <div className="candidate-cell">
                                                    <Avatar name={c.name} />
                                                    <div>
                                                        <div className="candidate-name">{c.name}</div>
                                                        {c.location && <div className="candidate-location">📍 {c.location}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.88rem' }}>{c.email}</div>
                                                {c.phone && <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '2px' }}>{c.phone}</div>}
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{c.role}</td>
                                            <td>
                                                <span className="source-badge">{c.source || '—'}</span>
                                            </td>
                                            <td>{c.experience} {c.experience === 1 ? 'yr' : 'yrs'}</td>
                                            <td>
                                                <span className={`priority-badge priority-${(c.priority || 'normal').toLowerCase()}`}>
                                                    {c.priority || 'Normal'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-icon" onClick={() => openViewModal(c)} title="View Profile">👁️</button>
                                                    <button className="btn-icon" onClick={() => openEditModal(c)} title="Edit">✏️</button>
                                                    <button className="btn-icon" onClick={() => handleDelete(c._id)} title="Delete" style={{ color: '#ef4444' }}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {candidates.length > 0 && (
                            <div className="table-footer">
                                Showing <strong>{candidates.length}</strong> candidate{candidates.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                )}

                {/* Kanban View */}
                {activeTab === 'kanban' && (
                    <div className="kanban-board">
                        {STAGES.map(stage => {
                            const cols = candidates.filter(c => c.status === stage);
                            return (
                                <div key={stage} className={`kanban-col kanban-col-${stage.toLowerCase()}`}>
                                    <div className="kanban-col-header">
                                        <span className={`badge badge-${stage.toLowerCase()}`}>{stage}</span>
                                        <span className="kanban-count">{cols.length}</span>
                                    </div>
                                    <div className="kanban-cards">
                                        {cols.length === 0 ? (
                                            <div className="kanban-empty">No candidates</div>
                                        ) : cols.map(c => (
                                            <div key={c._id} className="kanban-card" onClick={() => openViewModal(c)}>
                                                <div className="kanban-card-top">
                                                    <Avatar name={c.name} />
                                                    <div style={{ minWidth: 0 }}>
                                                        <div className="candidate-name" style={{ fontSize: '0.9rem' }}>{c.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{c.role}</div>
                                                    </div>
                                                </div>
                                                {c.location && <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '6px' }}>📍 {c.location}</div>}
                                                <div className="kanban-card-footer">
                                                    <span>{c.experience} yrs</span>
                                                    <span className={`priority-badge priority-${(c.priority || 'normal').toLowerCase()}`} style={{ fontSize: '0.72rem', padding: '2px 7px' }}>
                                                        {c.priority || 'Normal'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Add Modal */}
            {showAddModal && (
                <CandidateForm
                    data={newCandidate}
                    setData={setNewCandidate}
                    onSubmit={handleAddSubmit}
                    onCancel={() => setShowAddModal(false)}
                    title="Create Candidate Profile"
                    submitLabel="Add Candidate"
                />
            )}

            {/* Edit Modal */}
            {showEditModal && selectedCandidate && (
                <CandidateForm
                    data={selectedCandidate}
                    setData={setSelectedCandidate}
                    onSubmit={handleEditSubmit}
                    onCancel={() => { setShowEditModal(false); setSelectedCandidate(null); }}
                    title="Edit Candidate Profile"
                    submitLabel="Save Changes"
                />
            )}

            {/* View Profile Modal */}
            {showViewModal && viewCandidate && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowViewModal(false)}>
                    <div className="modal-content modal-profile">
                        <div className="modal-header">
                            <h3>Candidate Profile</h3>
                            <button className="btn-close" onClick={() => setShowViewModal(false)}>×</button>
                        </div>
                        <div className="profile-header">
                            <Avatar name={viewCandidate.name} />
                            <div>
                                <h2 className="profile-name">{viewCandidate.name}</h2>
                                <p className="profile-role">{viewCandidate.role}</p>
                                <span className={`badge badge-${viewCandidate.status.toLowerCase()}`}>{viewCandidate.status}</span>
                            </div>
                        </div>
                        <div className="profile-grid">
                            <div className="profile-field"><span className="pf-label">📧 Email</span><span className="pf-val">{viewCandidate.email}</span></div>
                            {viewCandidate.phone && <div className="profile-field"><span className="pf-label">📱 Phone</span><span className="pf-val">{viewCandidate.phone}</span></div>}
                            {viewCandidate.location && <div className="profile-field"><span className="pf-label">📍 Location</span><span className="pf-val">{viewCandidate.location}</span></div>}
                            <div className="profile-field"><span className="pf-label">💼 Experience</span><span className="pf-val">{viewCandidate.experience} years</span></div>
                            {viewCandidate.source && <div className="profile-field"><span className="pf-label">🔗 Source</span><span className="pf-val">{viewCandidate.source}</span></div>}
                            {viewCandidate.priority && <div className="profile-field"><span className="pf-label">🚦 Priority</span><span className={`priority-badge priority-${viewCandidate.priority.toLowerCase()}`}>{viewCandidate.priority}</span></div>}
                        </div>

                        {viewCandidate.notes && (
                            <div style={{ marginTop: '16px' }}>
                                <span className="pf-label">📝 Notes</span>
                                <p style={{ marginTop: '6px', color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.6 }}>{viewCandidate.notes}</p>
                            </div>
                        )}
                        <div className="modal-footer">
                            <button className="secondary" onClick={() => setShowViewModal(false)}>Close</button>
                            <button className="primary" onClick={() => { setShowViewModal(false); openEditModal(viewCandidate); }}>Edit Profile</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Developer Modal */}
            {showContactModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowContactModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '32px' }}>
                        <div className="candidate-avatar" style={{ '--hue': 220, margin: '0 auto 16px auto', width: '64px', height: '64px', fontSize: '1.5rem' }}>
                            MT
                        </div>
                        <h3 style={{ marginBottom: '8px' }}>G. Mohit Tej</h3>
                        <p style={{ color: '#9ca3af', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            For further development, inquiries, or support related to this project, please get in touch.
                        </p>
                        <a href="mailto:mohittejgowraa@gmail.com" className="primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '10px 24px', borderRadius: '6px' }}>
                            ✉️ mohittejgowraa@gmail.com
                        </a>
                        <button className="secondary" onClick={() => setShowContactModal(false)} style={{ display: 'block', margin: '16px auto 0 auto', border: 'none', background: 'transparent' }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
