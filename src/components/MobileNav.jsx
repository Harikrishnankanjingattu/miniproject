import React from 'react';
import {
    LayoutDashboard,
    UserPlus,
    Megaphone,
    Package,
    PhoneForwarded,
    User
} from 'lucide-react';
import '../styles/MobileNav.css';

const MobileNav = ({ activeSection, onSectionChange, moduleSettings }) => {
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
        ...(moduleSettings?.leadsEnabled !== false ? [{ id: 'leads', icon: UserPlus, label: 'Leads' }] : []),
        ...(moduleSettings?.campaignsEnabled !== false ? [{ id: 'campaigns', icon: Megaphone, label: 'Ads' }] : []),
        { id: 'products', icon: Package, label: 'Stock' },
        { id: 'history', icon: PhoneForwarded, label: 'Calls' },
        { id: 'profile', icon: User, label: 'Me' }
    ];

    return (
        <nav className="mobile-nav glass-effect">
            <div className="mobile-nav-container">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => onSectionChange(item.id)}
                        >
                            <div className="icon-wrapper">
                                <Icon size={20} />
                                {isActive && <div className="active-glow"></div>}
                            </div>
                            <span className="nav-text">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;
