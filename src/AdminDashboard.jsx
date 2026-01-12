import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { LogOut, Search, Users, ShieldAlert, ShieldCheck, Settings2, ToggleLeft, ToggleRight } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [moduleSettings, setModuleSettings] = useState({
        leadsEnabled: true,
        campaignsEnabled: true
    });

    useEffect(() => {
        fetchUsers();
        fetchModuleSettings();
    }, []);

    const fetchModuleSettings = async () => {
        try {
            const docRef = doc(db, 'settings', 'modules');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setModuleSettings(docSnap.data());
            } else {
                // Initialize default settings if not exists
                await setDoc(docRef, {
                    leadsEnabled: true,
                    campaignsEnabled: true
                });
            }
        } catch (error) {
            console.error("Error fetching module settings:", error);
        }
    };

    const toggleModule = async (module) => {
        const newValue = !moduleSettings[module];
        const newSettings = { ...moduleSettings, [module]: newValue };
        try {
            await setDoc(doc(db, 'settings', 'modules'), newSettings);
            setModuleSettings(newSettings);
        } catch (error) {
            alert("Error updating module settings: " + error.message);
        }
    };

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const usersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await updateDoc(doc(db, 'users', userId), {
                status: newStatus
            });
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (error) {
            alert("Error updating status: " + error.message);
        }
    };

    const toggleUserModule = async (userId, module, currentVal) => {
        const newVal = currentVal === false ? true : false;
        try {
            await updateDoc(doc(db, 'users', userId), {
                [module]: newVal
            });
            setUsers(users.map(u => u.id === userId ? { ...u, [module]: newVal } : u));
        } catch (error) {
            alert("Error updating user module: " + error.message);
        }
    };

    const updateTimer = async (userId, minutes) => {
        try {
            const timeoutVal = minutes ? parseInt(minutes) : null;
            await updateDoc(doc(db, 'users', userId), {
                sessionTimeout: timeoutVal,
                sessionStartedAt: timeoutVal ? new Date().toISOString() : null
            });
            setUsers(users.map(u => u.id === userId ? { ...u, sessionTimeout: timeoutVal } : u));
            if (timeoutVal) alert(`Timer set to ${timeoutVal} minutes for this user.`);
            else alert("Timer removed for this user.");
        } catch (error) {
            alert("Error updating timer: " + error.message);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active' && u.role !== 'admin').length,
        suspended: users.filter(u => u.status === 'suspended').length
    };

    if (loading) return (
        <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading Secure Admin Panel...</p>
        </div>
    );

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="header-title">
                    <h1>Admin Console</h1>
                    <p>Security & User Management Control</p>
                </div>
                <button className="logout-btn" onClick={() => auth.signOut()}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <p className="card-label">Total Users</p>
                    <p className="stat-value">{stats.total}</p>
                </div>
                <div className="stat-card active">
                    <p className="card-label">Active Sub-Admins</p>
                    <p className="stat-value">{stats.active}</p>
                </div>
                <div className="stat-card suspended">
                    <p className="card-label">Suspended Accounts</p>
                    <p className="stat-value">{stats.suspended}</p>
                </div>
            </div>

            <section className="settings-section">
                <div className="section-header">
                    <Settings2 size={24} color="#1e3a8a" />
                    <h2>Global Module Control</h2>
                </div>
                <div className="settings-grid">
                    <div className="settings-card">
                        <div className="settings-info">
                            <h3>Lead Generation Module</h3>
                            <p>Enable or disable lead generation features for all users</p>
                        </div>
                        <button
                            className={`toggle-btn ${moduleSettings.leadsEnabled ? 'on' : 'off'}`}
                            onClick={() => toggleModule('leadsEnabled')}
                        >
                            {moduleSettings.leadsEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                            <span>{moduleSettings.leadsEnabled ? 'ENABLED' : 'DISABLED'}</span>
                        </button>
                    </div>

                    <div className="settings-card">
                        <div className="settings-info">
                            <h3>Campaign Management</h3>
                            <p>Enable or disable marketing campaigns for all users</p>
                        </div>
                        <button
                            className={`toggle-btn ${moduleSettings.campaignsEnabled ? 'on' : 'off'}`}
                            onClick={() => toggleModule('campaignsEnabled')}
                        >
                            {moduleSettings.campaignsEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                            <span>{moduleSettings.campaignsEnabled ? 'ENABLED' : 'DISABLED'}</span>
                        </button>
                    </div>
                </div>
            </section>

            <section className="table-section">
                <div className="table-controls">
                    <h2>User Activity Center</h2>
                    <div className="control-group">
                        <div className="search-input-wrapper">
                            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.8rem' }} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="status-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Access</option>
                            <option value="active">Active Only</option>
                            <option value="suspended">Suspended Only</option>
                        </select>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Entity / Company</th>
                                <th>Credits</th>
                                <th>Lead Gen</th>
                                <th>Campaign</th>
                                <th>Session Timer</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-entity">
                                            <div className="company">{user.company || 'Enterprise User'}</div>
                                            <div className="email">{user.email}</div>
                                            {user.role === 'admin' && <span className="admin-badge">MASTER ADMIN</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="credit-value">{user.credits ?? '0'}</span>
                                    </td>
                                    <td>
                                        {user.role !== 'admin' && (
                                            <button
                                                className={`module-toggle-pill ${user.leadsEnabled !== false ? 'enabled' : 'disabled'}`}
                                                onClick={() => toggleUserModule(user.id, 'leadsEnabled', user.leadsEnabled)}
                                            >
                                                {user.leadsEnabled !== false ? 'ON' : 'OFF'}
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        {user.role !== 'admin' && (
                                            <button
                                                className={`module-toggle-pill ${user.campaignsEnabled !== false ? 'enabled' : 'disabled'}`}
                                                onClick={() => toggleUserModule(user.id, 'campaignsEnabled', user.campaignsEnabled)}
                                            >
                                                {user.campaignsEnabled !== false ? 'ON' : 'OFF'}
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        {user.role !== 'admin' && (
                                            <div className="timer-input-group">
                                                <input
                                                    type="number"
                                                    className="timer-input"
                                                    defaultValue={user.sessionTimeout || ''}
                                                    onBlur={(e) => updateTimer(user.id, e.target.value)}
                                                />
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>min</span>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-pill ${user.status}`}>
                                            {user.status === 'active' ? 'Authorized' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.role !== 'admin' && (
                                            <button
                                                className={`action-btn ${user.status === 'active' ? 'suspend' : 'activate'}`}
                                                onClick={() => toggleUserStatus(user.id, user.status)}
                                            >
                                                {user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="empty-state">
                            <Users size={48} color="#e2e8f0" />
                            <p>No user records match your search criteria.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
