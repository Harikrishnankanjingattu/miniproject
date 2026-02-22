import React, { useState } from 'react';
import {
    LayoutDashboard,
    UserPlus,
    Megaphone,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    PhoneForwarded,
    Settings,
    HelpCircle,
    Menu,
    X,
    Clock,
    Package
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ activeSection, onSectionChange, user, userProfile, onLogout, isMobileOpen, isMobile, moduleSettings, toggleMobileMenu }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const getDisplayName = () => {
        if (userProfile?.role === 'admin') return 'Master Admin';
        return userProfile?.company || user?.email?.split('@')[0] || 'User';
    };

    const finalMenuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
        ...(moduleSettings?.leadsEnabled !== false && (userProfile?.leadsEnabled !== false) ? [{ id: 'leads', icon: UserPlus, label: 'Lead Gen' }] : []),
        ...(moduleSettings?.campaignsEnabled !== false && (userProfile?.campaignsEnabled !== false) ? [{ id: 'campaigns', icon: Megaphone, label: 'Campaigns' }] : []),
        { id: 'products', icon: Package, label: 'Products' },
        { id: 'history', icon: PhoneForwarded, label: 'Call History' },
        { id: 'profile', icon: User, label: 'Account' }
    ];

    return (
        <>
            <aside className={`sidebar glass-effect ${isCollapsed && !isMobile ? 'collapsed' : ''} ${isMobile && isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-dot"></div>
                        <span className="brand-name">AutoConnect</span>
                    </div>
                    {!isMobile && (
                        <button
                            className="collapse-toggle"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                    )}
                    {isMobile && (
                        <button className="collapse-toggle" onClick={toggleMobileMenu}>
                            <X size={18} />
                        </button>
                    )}
                </div>

                <nav className="sidebar-content">
                    <div className="nav-section">
                        <span className="section-tag">Menu</span>
                        {finalMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                                    onClick={() => {
                                        onSectionChange(item.id);
                                        if (isMobile) toggleMobileMenu();
                                    }}
                                >
                                    <Icon size={20} className="nav-icon" />
                                    <span className="nav-label">{item.label}</span>
                                    {activeSection === item.id && <div className="active-dot"></div>}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile-mini">
                        <div className="user-avatar-wrap">
                            {userProfile?.companyLogo ? (
                                <img src={userProfile.companyLogo} alt="Logo" className="avatar-img" />
                            ) : (
                                <div className="avatar-initial">
                                    {userProfile?.company?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="status-indicator"></div>
                        </div>
                        <div className="user-meta">
                            <span className="user-name">{getDisplayName()}</span>
                            <span className="user-plan">{userProfile?.plan || 'Free Plan'}</span>
                        </div>
                        <button className="btn-logout" onClick={onLogout}>
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>
            {isMobile && isMobileOpen && <div className="sidebar-overlay visible" onClick={toggleMobileMenu}></div>}
        </>
    );
};


export default Sidebar;

