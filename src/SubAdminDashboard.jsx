import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { Menu, X, Clock } from 'lucide-react';
import { auth, db } from './firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadGeneration from './components/LeadGeneration';
import CampaignManager from './components/CampaignManager';
import ProductManager from './components/ProductManager';
import ProfileSettings from './components/ProfileSettings';
import CallHistory from './components/CallHistory';
import MobileNav from './components/MobileNav';

function SubAdminDashboard({ user, userProfile, googleToken, onGoogleAuth }) {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [timeLeft, setTimeLeft] = useState(null);
    const [moduleSettings, setModuleSettings] = useState({
        leadsEnabled: true,
        campaignsEnabled: true
    });

    const combinedSettings = {
        leadsEnabled: moduleSettings.leadsEnabled && (userProfile?.leadsEnabled !== false),
        campaignsEnabled: moduleSettings.campaignsEnabled && (userProfile?.campaignsEnabled !== false)
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'settings', 'modules'), (doc) => {
            if (doc.exists()) {
                const settings = doc.data();
                setModuleSettings(settings);

                const isLeadsOff = !settings.leadsEnabled || userProfile?.leadsEnabled === false;
                const isCampaignsOff = !settings.campaignsEnabled || userProfile?.campaignsEnabled === false;

                if (isLeadsOff && activeSection === 'leads') setActiveSection('dashboard');
                if (isCampaignsOff && activeSection === 'campaigns') setActiveSection('dashboard');
            }
        });

        return () => unsubscribe();
    }, [activeSection, userProfile]);

    const handleLogout = React.useCallback(async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }, []);

    useEffect(() => {
        if (!userProfile?.sessionTimeout || !userProfile?.sessionStartedAt || userProfile.role === 'admin') {
            setTimeLeft(null);
            return;
        }

        const interval = setInterval(() => {
            const start = new Date(userProfile.sessionStartedAt).getTime();
            const limit = userProfile.sessionTimeout * 60 * 1000;
            const now = new Date().getTime();
            const remaining = Math.max(0, limit - (now - start));

            if (remaining <= 0) {
                clearInterval(interval);
                signOut(auth).then(() => {
                    alert("Your session has expired. You have been logged out.");
                    window.location.reload();
                });
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [userProfile]);

    const formatTime = (ms) => {
        const totalSecs = Math.floor(ms / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
        if (isMobile) setIsMobileMenuOpen(false);
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <Dashboard user={user} userProfile={userProfile} />;
            case 'leads':
                return combinedSettings.leadsEnabled ?
                    <LeadGeneration user={user} userProfile={userProfile} /> :
                    <Dashboard user={user} userProfile={userProfile} />;
            case 'campaigns':
                return combinedSettings.campaignsEnabled ?
                    <CampaignManager user={user} userProfile={userProfile} /> :
                    <Dashboard user={user} userProfile={userProfile} />;
            case 'products':
                return <ProductManager user={user} userProfile={userProfile} googleToken={googleToken} onGoogleAuth={onGoogleAuth} />;
            case 'profile':
                return <ProfileSettings user={user} userProfile={userProfile} googleToken={googleToken} onGoogleAuth={onGoogleAuth} />;
            case 'history':
                return <CallHistory user={user} />;
            default:
                return <Dashboard user={user} userProfile={userProfile} />;
        }
    };

    return (
        <div className={`subadmin-dashboard ${isMobile ? 'is-mobile' : ''}`}>
            {isMobile && (
                <header className="mobile-dashboard-header glass-effect">
                    <div className="mobile-branding">
                        <div className="mini-logo">
                            {userProfile?.companyLogo ? (
                                <img src={userProfile.companyLogo} alt="Logo" />
                            ) : (
                                <span>{userProfile?.company?.charAt(0) || 'A'}</span>
                            )}
                        </div>
                        <span className="mobile-brand-name">{userProfile?.company || 'AutoConnect'}</span>
                    </div>
                    {timeLeft !== null && (
                        <div className={`mobile-session-timer ${timeLeft < 60000 ? 'warning' : ''}`}>
                            <Clock size={14} />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </header>
            )}

            {!isMobile && (
                <Sidebar
                    activeSection={activeSection}
                    onSectionChange={handleSectionChange}
                    user={user}
                    userProfile={userProfile}
                    onLogout={handleLogout}
                    isMobileOpen={isMobileMenuOpen}
                    isMobile={isMobile}
                    moduleSettings={combinedSettings}
                    toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
            )}

            <main className="main-content">
                {renderContent()}
            </main>

            {isMobile && (
                <MobileNav
                    activeSection={activeSection}
                    onSectionChange={handleSectionChange}
                    moduleSettings={combinedSettings}
                />
            )}
        </div>
    );
}

export default SubAdminDashboard;
