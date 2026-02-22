import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, Image as ImageIcon, Save, Smartphone } from 'lucide-react';
import { updateUserProfile } from '../services/firebaseService';
import '../styles/ProfileSettings.css';

const ProfileSettings = ({ user, userProfile, googleToken, onGoogleAuth }) => {
    const [formData, setFormData] = useState({
        company: '',
        companyEmail: '',
        companyPhone: '',
        companyLogo: '',
        googleAppsScriptUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                company: userProfile.company || '',
                companyEmail: userProfile.companyEmail || user.email || '',
                companyPhone: userProfile.companyPhone || '',
                companyLogo: userProfile.companyLogo || '',
                googleAppsScriptUrl: userProfile.googleAppsScriptUrl || ''
            });
        }
    }, [userProfile, user.email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTestConnection = async () => {
        if (!formData.googleAppsScriptUrl) {
            setMessage({ type: 'error', text: 'Please enter a URL first' });
            return;
        }
        setTestLoading(true);
        setMessage({ type: 'info', text: 'Testing Cloud Connection...' });

        try {
            // Test by attempting to send a small dummy ping
            const response = await fetch(formData.googleAppsScriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'PING', data: ['ping'] })
            });
            setMessage({ type: 'success', text: 'Connection Success! Your sheet is connected.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection Failed. Please check the URL.' });
        } finally {
            setTestLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await updateUserProfile(user.uid, formData);
            if (result.success) {
                setMessage({ type: 'success', text: 'Profile and cloud settings saved successfully!' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container glass-effect reveal-up">
            <div className="profile-header reveal-up delay-1">
                <div className="profile-title">
                    <Building2 size={32} color="var(--primary)" />
                    <div>
                        <h2>Profile Settings</h2>
                        <p>Manage your company details and cloud synchronization</p>
                    </div>
                </div>

                <div className={`google-status-pill ${googleToken ? 'connected' : ''}`}>
                    <Smartphone size={16} />
                    <span>{googleToken ? 'Sheets API Authorized' : 'Authorization Required'}</span>
                </div>
            </div>

            {message.text && (
                <div className={`status-msg ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-grid reveal-up delay-2">
                <form onSubmit={handleSubmit} className="profile-form">
                    <section className="settings-section">
                        <h3><Building2 size={18} /> Company Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="company">Company Name</label>
                                <div className="input-wrapper">
                                    <Building2 size={18} />
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        placeholder="Enter company name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="companyEmail">Company Email</label>
                                <div className="input-wrapper">
                                    <Mail size={18} />
                                    <input
                                        type="email"
                                        id="companyEmail"
                                        name="companyEmail"
                                        value={formData.companyEmail}
                                        onChange={handleChange}
                                        placeholder="company@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="companyPhone">Company Phone</label>
                                <div className="input-wrapper">
                                    <Phone size={18} />
                                    <input
                                        type="tel"
                                        id="companyPhone"
                                        name="companyPhone"
                                        value={formData.companyPhone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="settings-section">
                        <h3><Save size={18} /> Cloud Synchronization</h3>
                        <div className="google-auth-box">
                            <div className="auth-info">
                                <h4>Google Sheets Connection</h4>
                                <p>Authenticate with Google to enable real-time inventory sync and secure data flow.</p>
                            </div>
                            <button
                                type="button"
                                onClick={onGoogleAuth}
                                className={`google-connect-btn ${googleToken ? 'connected' : ''}`}
                            >
                                <Smartphone size={18} />
                                {googleToken ? 'Google Connected' : 'Connect Google Sheets'}
                            </button>
                        </div>

                        <div className="form-group">
                            <label htmlFor="googleAppsScriptUrl">Legacy Apps Script URL (Optional)</label>
                            <div className="input-wrapper" style={{ display: 'flex', gap: '0.5rem' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <ImageIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="url"
                                        id="googleAppsScriptUrl"
                                        name="googleAppsScriptUrl"
                                        value={formData.googleAppsScriptUrl}
                                        onChange={handleChange}
                                        style={{ paddingLeft: '3rem' }}
                                        placeholder="Enter legacy Apps Script URL"
                                    />
                                </div>
                                <button type="button" onClick={handleTestConnection} className="test-btn" disabled={testLoading}>
                                    {testLoading ? '...' : 'Test'}
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="settings-section">
                        <h3><ImageIcon size={18} /> Branding</h3>
                        <div className="form-group">
                            <label htmlFor="companyLogo">Company Logo URL</label>
                            <div className="input-wrapper">
                                <ImageIcon size={18} />
                                <input
                                    type="url"
                                    id="companyLogo"
                                    name="companyLogo"
                                    value={formData.companyLogo}
                                    onChange={handleChange}
                                    placeholder="Enter logo image URL"
                                />
                            </div>
                            {formData.companyLogo && (
                                <div className="logo-preview-wrap">
                                    <p>Logo Preview:</p>
                                    <img src={formData.companyLogo} alt="Logo Preview" className="logo-preview" />
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="profile-actions">
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Saving...' : (
                                <>
                                    <Save size={18} />
                                    Save Profile Settings
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
