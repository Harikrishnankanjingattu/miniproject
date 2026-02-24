import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, Image as ImageIcon, Save, Smartphone } from 'lucide-react';
import { updateUserProfile } from '../../services/firebaseService';

const GammaProfileSettings = ({ user, userProfile, googleToken, onGoogleAuth }: any) => {
  const [formData, setFormData] = useState({ company: '', companyEmail: '', companyPhone: '', companyLogo: '', googleAppsScriptUrl: '' });
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        company: userProfile.company || '', companyEmail: userProfile.companyEmail || user.email || '',
        companyPhone: userProfile.companyPhone || '', companyLogo: userProfile.companyLogo || '',
        googleAppsScriptUrl: userProfile.googleAppsScriptUrl || ''
      });
    }
  }, [userProfile, user.email]);

  const handleTest = async () => {
    if (!formData.googleAppsScriptUrl) { setMessage({ type: 'error', text: 'Enter URL first' }); return; }
    setTestLoading(true);
    try {
      await fetch(formData.googleAppsScriptUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'PING', data: ['ping'] }) });
      setMessage({ type: 'success', text: 'Connection success!' });
    } catch { setMessage({ type: 'error', text: 'Connection failed' }); }
    finally { setTestLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage({ type: '', text: '' });
    try {
      const result = await updateUserProfile(user.uid, formData);
      setMessage(result.success ? { type: 'success', text: 'Saved!' } : { type: 'error', text: result.error || 'Failed' });
    } catch { setMessage({ type: 'error', text: 'Error occurred' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-foreground">Profile Settings</h1>
          <p className="section-subtitle">Manage company details & cloud sync</p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${googleToken ? 'bg-emerald-500/10 text-emerald-400' : 'bg-secondary text-muted-foreground'}`}>
          <Smartphone size={12} /> {googleToken ? 'API Authorized' : 'Not Connected'}
        </div>
      </div>

      {message.text && <div className={message.type === 'success' ? 'message-success' : 'message-error'}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2"><Building2 size={16} className="text-primary" /> Company Info</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Company Name</label>
              <input className="input-gamma" value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Email</label>
              <input type="email" className="input-gamma" value={formData.companyEmail} onChange={e => setFormData(p => ({ ...p, companyEmail: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Phone</label>
              <input type="tel" className="input-gamma" value={formData.companyPhone} onChange={e => setFormData(p => ({ ...p, companyPhone: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2"><Save size={16} className="text-primary" /> Cloud Sync</h3>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">Google Sheets</p>
              <p className="text-xs text-muted-foreground">Enable real-time inventory sync</p>
            </div>
            <button type="button" onClick={onGoogleAuth} className={`text-xs font-medium px-3 py-1.5 rounded-lg ${googleToken ? 'bg-emerald-500/10 text-emerald-400' : 'btn-gamma py-1.5'}`}>
              {googleToken ? '✓ Connected' : 'Connect'}
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Apps Script URL (Optional)</label>
            <div className="flex gap-2">
              <input type="url" className="input-gamma flex-1" placeholder="https://script.google.com/..." value={formData.googleAppsScriptUrl} onChange={e => setFormData(p => ({ ...p, googleAppsScriptUrl: e.target.value }))} />
              <button type="button" className="btn-ghost text-xs" onClick={handleTest} disabled={testLoading}>{testLoading ? '...' : 'Test'}</button>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2"><ImageIcon size={16} className="text-primary" /> Branding</h3>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Logo URL</label>
            <input type="url" className="input-gamma" placeholder="https://..." value={formData.companyLogo} onChange={e => setFormData(p => ({ ...p, companyLogo: e.target.value }))} />
            {formData.companyLogo && (
              <div className="mt-3">
                <img src={formData.companyLogo} alt="Preview" className="h-16 rounded-lg border border-border object-contain" />
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="btn-gamma flex items-center gap-2" disabled={loading}>
          <Save size={16} /> {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default GammaProfileSettings;
