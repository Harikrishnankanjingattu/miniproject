import React, { useState, useEffect } from 'react';
import { UserPlus, Megaphone, TrendingUp, Calendar, ArrowUpRight, Search } from 'lucide-react';
import { getAnalytics } from '../services/firebaseService';
import { readFromGoogleSheets } from '../services/googleSheets';
import '../styles/Dashboard.css';

const Dashboard = ({ user, userProfile }) => {
    const [analytics, setAnalytics] = useState({
        totalLeads: 0,
        totalUsers: 0,
        totalCampaigns: 0,
        recentLeads: []
    });
    const [sheetLeads, setSheetLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [analyticsData, sheetsData] = await Promise.all([
                getAnalytics(user.uid),
                readFromGoogleSheets()
            ]);

            setAnalytics(analyticsData);
            setSheetLeads(sheetsData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, color, delay }) => (
        <div className="premium-stat-card glass-effect animate-fade" style={{ animationDelay: `${delay}s` }}>
            <div className="card-inner">
                <div className="stat-label">
                    <div className="icon-box" style={{ background: `${color}15`, color }}>
                        <Icon size={20} />
                    </div>
                    <span>{title}</span>
                </div>
                <div className="stat-main">
                    <h2>{loading ? '...' : value}</h2>
                    <div className="stat-trend positive">
                        <ArrowUpRight size={14} />
                        <span>12%</span>
                    </div>
                </div>
            </div>
            <div className="card-spark" style={{ background: color }}></div>
        </div>
    );

    return (
        <div className="dashboard-root">
            <header className="page-header animate-fade">
                <div className="header-info">
                    <h1>Overview</h1>
                    <p>Welcome back, {userProfile?.company || 'Partner'}! Here's your business at a glance.</p>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="stats-grid">
                    <StatCard
                        icon={UserPlus}
                        title="Total Leads"
                        value={analytics.totalLeads + sheetLeads.length}
                        color="#3b82f6"
                        delay={0.1}
                    />
                    <StatCard
                        icon={Megaphone}
                        title="Campaigns"
                        value={analytics.totalCampaigns}
                        color="#8b5cf6"
                        delay={0.2}
                    />
                    <StatCard
                        icon={TrendingUp}
                        title="Conversion"
                        value="84%"
                        color="#10b981"
                        delay={0.3}
                    />
                </div>

                <section className="dashboard-main-grid">
                    <div className="leads-container glass-effect animate-slide">
                        <div className="container-header">
                            <div>
                                <h2>Recent Leads</h2>
                                <p>Latest customer acquisitions across all channels</p>
                            </div>
                            <div className="header-actions">
                                <div className="search-mini">
                                    <Search size={16} />
                                    <input type="text" placeholder="Filter..." />
                                </div>
                            </div>
                        </div>

                        <div className="table-wrap">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Contact</th>
                                        <th>Source</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.recentLeads.slice(0, 5).map((lead) => (
                                        <tr key={lead.id}>
                                            <td>
                                                <div className="customer-info">
                                                    <div className="avatar-mini">{lead.name.charAt(0)}</div>
                                                    <span>{lead.name}</span>
                                                </div>
                                            </td>
                                            <td>{lead.number}</td>
                                            <td><span className="source-tag firebase">Firebase</span></td>
                                            <td>{lead.createdAt ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                            <td><span className="status-dot online"></span> New</td>
                                        </tr>
                                    ))}
                                    {sheetLeads.slice(0, 3).map((lead, idx) => (
                                        <tr key={`sh-${idx}`}>
                                            <td>
                                                <div className="customer-info">
                                                    <div className="avatar-mini">{lead.name.charAt(0)}</div>
                                                    <span>{lead.name}</span>
                                                </div>
                                            </td>
                                            <td>{lead.number}</td>
                                            <td><span className="source-tag sheets">Sheets</span></td>
                                            <td>{lead.timestamp || 'N/A'}</td>
                                            <td><span className="status-dot"></span> Pending</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div >
    );
};

export default Dashboard;

