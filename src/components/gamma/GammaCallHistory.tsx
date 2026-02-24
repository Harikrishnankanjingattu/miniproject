import { useState, useEffect } from 'react';
import { PhoneForwarded, Search, Calendar, User, Clock, FileText } from 'lucide-react';
import { getCallHistory } from '../../services/firebaseService';

const GammaCallHistory = ({ user }: { user: any }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { if (user?.uid) loadHistory(); }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try { setHistory(await getCallHistory(user.uid)); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = history.filter(i =>
    i.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title text-foreground">Call History</h1>
        <p className="section-subtitle">Review previous calls and summaries</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input className="input-gamma pl-9" placeholder="Search calls..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">
          <PhoneForwarded size={40} className="mx-auto mb-3 opacity-30" />
          <p>{searchTerm ? 'No matches' : 'No call history'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="glass-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-primary" />
                    <span className="font-medium text-foreground">{item.leadName || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                </div>
                <span className={`status-pill ${(item.status?.toLowerCase() || 'completed') === 'completed' ? 'active' : 'suspended'}`}>
                  {item.status || 'Completed'}
                </span>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <FileText size={12} /> Summary
                </div>
                <p className="text-sm text-foreground">{item.summary || 'No summary provided.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GammaCallHistory;
