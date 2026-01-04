import React, { useState } from 'react';
import {
    LayoutDashboard,
    UserPlus,
    Megaphone,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ activeSection, onSectionChange, user, userProfile, onLogout, isMobileOpen, isMobile }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'leads', icon: UserPlus, label: 'Lead Generation' },
        { id: 'campaigns', icon: Megaphone, label: 'Campaigns' }
    ];

    // Extract company name from email (before @) or use full email
    const getDisplayName = () => {
        if (userProfile?.company) return userProfile.company;
        if (!user?.email) return 'User';
        const emailParts = user.email.split('@');
        return emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile && isMobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
                {!isCollapsed && (
                    <div>
                        <h2>{getDisplayName()}</h2>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                            <span style={{
                                background: '#e0f2fe',
                                color: '#0369a1',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold'
                            }}>
                                {userProfile?.plan || 'trial'}
                            </span>
                        </div>
                    </div>
                )}
                <button
                    className="collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => onSectionChange(item.id)}
                            title={isCollapsed ? item.label : ''}
                        >
                            <Icon size={20} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {!isCollapsed && (
                <div style={{ padding: '1rem', margin: '0 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Credits Available</p>
                    <p style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                        {userProfile?.credits ?? 0}
                    </p>
                    <button
                        onClick={() => window.location.reload()} // Reload triggers App.jsx to show PlansPage if credits <= 0
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.7rem', padding: 0, marginTop: '8px', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Upgrade Plan
                    </button>
                </div>
            )}

            <div className="sidebar-footer">
                {!isCollapsed ? (
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                            <p className="user-name">{getDisplayName()}</p>
                            <p className="user-role">{user?.email || 'user@example.com'}</p>
                        </div>
                        <button className="logout-btn" onClick={onLogout} title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <button className="logout-btn-collapsed" onClick={onLogout} title="Logout">
                        <LogOut size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
