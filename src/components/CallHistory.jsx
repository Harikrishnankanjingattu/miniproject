import React, { useState, useEffect } from 'react';
import { PhoneForwarded, Search, Calendar, User, Clock, FileText } from 'lucide-react';
import { getCallHistory } from '../services/firebaseService';
import '../styles/CallHistory.css';

const CallHistory = ({ user }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.uid) {
            loadHistory();
        }
    }, [user]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await getCallHistory(user.uid);
            setHistory(data);
        } catch (error) {
            console.error('Error loading call history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(item =>
        item.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="call-history">
            <div className="section-header">
                <div>
                    <h1>Call History</h1>
                    <p className="section-subtitle">Review your previous calls and summaries</p>
                </div>
            </div>

            <div className="history-controls">
                <div className="search-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by lead name or summary..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="history-container">
                {loading ? (
                    <div className="loading-state">Loading call logs...</div>
                ) : filteredHistory.length === 0 ? (
                    <div className="empty-state">
                        <PhoneForwarded size={48} />
                        <p>{searchTerm ? 'No matches found' : 'No call history yet'}</p>
                    </div>
                ) : (
                    <div className="history-list">
                        {filteredHistory.map((item) => (
                            <div key={item.id} className="history-card">
                                <div className="card-main">
                                    <div className="lead-info">
                                        <div className="info-row">
                                            <User size={16} />
                                            <span className="lead-name">{item.leadName || 'Unknown Lead'}</span>
                                        </div>
                                        <div className="info-row">
                                            <Calendar size={16} />
                                            <span>{item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                                            <Clock size={16} style={{ marginLeft: '1rem' }} />
                                            <span>{item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="status-info">
                                        <span className={`status-badge ${item.status?.toLowerCase() || 'completed'}`}>
                                            {item.status || 'Completed'}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-summary">
                                    <div className="summary-header">
                                        <FileText size={16} />
                                        <span>Call Summary</span>
                                    </div>
                                    <p>{item.summary || 'No summary provided for this call.'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallHistory;
