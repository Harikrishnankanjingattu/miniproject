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
            const [campaignsData, leadsData, productsData] = await Promise.all([
                getCampaigns(user.uid),
                getLeads(user.uid),
                readProductsFromGoogleSheets()
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
                setShowModal(false);
                loadData();
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

            {/* Campaigns Grid */}
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
                                {campaign.scheduledDate && (
                                    <span className="scheduled-badge">
                                        Scheduled
                                    </span>
                                )}
                            </div>
                            <p className="campaign-description">{campaign.description}</p>

                            {campaign.productId && (
                                <div className="campaign-product-tag">
                                    <Package size={14} />
                                    <span>Linked: {products.find(p => p.id === campaign.productId)?.name || 'Product'}</span>
                                </div>
                            )}

                            {campaign.scheduledDate && (
                                <div className="schedule-info">
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

            {/* Create Campaign Modal */}
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
                                <label htmlFor="productId"><Package size={14} /> Link Product (Optional)</label>
                                <select
                                    id="productId"
                                    name="productId"
                                    value={formData.productId}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-glass)',
                                        background: 'var(--bg-deep)',
                                        color: 'var(--text-primary)'
                                    }}
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

                            <div className="form-row">
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
                                <div className="users-selection">
                                    {leads.length === 0 ? (
                                        <p className="no-users">No leads available. Create some leads first!</p>
                                    ) : (
                                        leads.map((lead) => (
                                            <label key={lead.id} className="user-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selectedUsers.includes(lead.id)}
                                                    onChange={() => handleUserSelection(lead.id)}
                                                />
                                                <span>{lead.name} - {lead.number}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            {message.text && (
                                <div className={`message ${message.type}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    <Megaphone size={18} />
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
