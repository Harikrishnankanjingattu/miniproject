import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, X, Users, Calendar, Tag, Package } from 'lucide-react';
import { addCampaign, getCampaigns, getLeads } from '../services/firebaseService';
import { readProductsFromGoogleSheets } from '../services/googleSheets';
import '../styles/CampaignManager.css';

const CampaignManager = ({ user }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [leads, setLeads] = useState([]);
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        selectedUsers: [],
        scheduledDate: '',
        scheduledTime: '',
        productId: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user?.uid) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('google_token');
            const [campaignsData, leadsData, productsData] = await Promise.all([
                getCampaigns(user.uid),
                getLeads(user.uid),
                readProductsFromGoogleSheets(token)
            ]);
            setCampaigns(campaignsData);
            setLeads(leadsData);
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUserSelection = (userId) => {
        setFormData(prev => ({
            ...prev,
            selectedUsers: prev.selectedUsers.includes(userId)
                ? prev.selectedUsers.filter(id => id !== userId)
                : [...prev.selectedUsers, userId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.description.trim() || !formData.scheduledDate || !formData.scheduledTime) {
            setMessage({ type: 'error', text: 'Please fill in all required fields including schedule' });
            return;
        }

        if (formData.selectedUsers.length === 0) {
            setMessage({ type: 'error', text: 'Please select at least one user' });
            return;
        }

        try {
            const campaignData = {
                name: formData.name,
                description: formData.description,
                selectedUsers: formData.selectedUsers,
                scheduledDate: formData.scheduledDate,
                scheduledTime: formData.scheduledTime,
                productId: formData.productId,
                status: 'active',
                createdDate: new Date().toISOString()
            };

            const result = await addCampaign(campaignData, user.uid);

            if (result.success) {
                setMessage({ type: 'success', text: 'Campaign created and scheduled successfully!' });
                setFormData({ name: '', description: '', selectedUsers: [], scheduledDate: '', scheduledTime: '', productId: '' });
                setTimeout(() => {
                    setShowModal(false);
                    loadData();
                }, 1500);
            } else {
                setMessage({ type: 'error', text: 'Failed to create campaign' });
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    const openModal = () => {
        setShowModal(true);
        setMessage({ type: '', text: '' });
        loadData();
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ name: '', description: '', selectedUsers: [], scheduledDate: '', scheduledTime: '', productId: '' });
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="campaign-manager">
            <div className="section-header">
                <div>
                    <h1>Campaign Management</h1>
                    <p className="section-subtitle">Create and manage your marketing campaigns</p>
                </div>
                <button className="create-btn" onClick={openModal}>
                    <Plus size={18} />
                    Create Campaign
                </button>
            </div>

            <div className="campaigns-grid">
                {loading ? (
                    <div className="loading-state">Loading campaigns...</div>
                ) : campaigns.length === 0 ? (
                    <div className="empty-state">
                        <Megaphone size={48} />
                        <p>No campaigns yet</p>
                        <span>Create your first campaign to get started</span>
                    </div>
                ) : (
                    campaigns.map((campaign) => (
                        <div key={campaign.id} className="campaign-card">
                            <div className="campaign-header">
                                <h3>{campaign.name}</h3>
                                <span className={`status-badge ${campaign.status}`}>
                                    {campaign.status}
                                </span>
                            </div>
                            <p className="campaign-description">{campaign.description}</p>

                            {campaign.productId && (
                                <div className="campaign-product-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
                                    <Package size={14} />
                                    <span>Linked: {products.find(p => p.id === campaign.productId)?.name || 'Product'}</span>
                                </div>
                            )}

                            {campaign.scheduledDate && (
                                <div className="schedule-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    <Calendar size={14} />
                                    <span>{new Date(campaign.scheduledDate).toLocaleDateString()} at {campaign.scheduledTime}</span>
                                </div>
                            )}

                            <div className="campaign-footer">
                                <div className="campaign-stat">
                                    <Users size={16} />
                                    <span>{campaign.selectedUsers?.length || 0} users</span>
                                </div>
                                <div className="campaign-stat">
                                    <Calendar size={16} />
                                    <span>
                                        {campaign.createdAt
                                            ? new Date(campaign.createdAt.seconds * 1000).toLocaleDateString()
                                            : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Campaign</h2>
                            <button className="close-btn" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="campaign-form">
                            <div className="form-group">
                                <label htmlFor="name">Campaign Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter campaign name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="productId" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={14} /> Link Product (Optional)</label>
                                <select
                                    id="productId"
                                    name="productId"
                                    value={formData.productId}
                                    onChange={handleChange}
                                    className="status-select"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                                >
                                    <option value="">No Product Linked</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>{product.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your campaign"
                                    rows="4"
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label htmlFor="scheduledDate">Scheduled Date *</label>
                                    <input
                                        type="date"
                                        id="scheduledDate"
                                        name="scheduledDate"
                                        value={formData.scheduledDate}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="scheduledTime">Scheduled Time *</label>
                                    <input
                                        type="time"
                                        id="scheduledTime"
                                        name="scheduledTime"
                                        value={formData.scheduledTime}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Select Users/Leads *</label>
                                <div className="users-selection" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem' }}>
                                    {leads.length === 0 ? (
                                        <p className="no-users" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No leads available.</p>
                                    ) : (
                                        leads.map((lead) => (
                                            <label key={lead.id} className="user-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selectedUsers.includes(lead.id)}
                                                    onChange={() => handleUserSelection(lead.id)}
                                                />
                                                <span style={{ fontSize: '0.9rem' }}>{lead.name} - {lead.number}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            {message.text && (
                                <div className={`message ${message.type}`} style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
                                    {message.text}
                                </div>
                            )}

                            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="cancel-btn" onClick={closeModal} style={{ flex: 1, padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 1, padding: '0.875rem', borderRadius: '8px', border: 'none', background: 'var(--primary-blue)', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                                    {loading ? 'Processing...' : 'Create Campaign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignManager;
