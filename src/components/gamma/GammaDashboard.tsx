import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Megaphone, TrendingUp, Search, ArrowUpRight } from 'lucide-react';
import { getAnalytics } from '../../services/firebaseService';
import { readFromGoogleSheets } from '../../services/googleSheets';

const GammaDashboard = ({ user, userProfile }: { user: any; userProfile: any }) => {
  const [analytics, setAnalytics] = useState({ totalLeads: 0, totalUsers: 0, totalCampaigns: 0, recentLeads: [] as any[] });
  const [sheetLeads, setSheetLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('google_token');
      const [a, s] = await Promise.all([getAnalytics(user.uid), readFromGoogleSheets(token)]);
      setAnalytics(a);
      setSheetLeads(s);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: UserPlus, title: 'Total Leads', value: analytics.totalLeads + (sheetLeads?.length || 0), color: 'text-primary' },
    { icon: Megaphone, title: 'Campaigns', value: analytics.totalCampaigns, color: 'text-violet-400' },
    { icon: TrendingUp, title: 'Conversion', value: '84%', color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title text-foreground">Overview</h1>
        <p className="section-subtitle">Welcome back, {userProfile?.company || 'Partner'}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{s.title}</span>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-display text-foreground">{loading ? '...' : s.value}</span>
              <span className="text-xs text-emerald-400 flex items-center gap-0.5 mb-1"><ArrowUpRight size={12} />12%</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <div>
            <h2 className="font-display font-semibold text-foreground">Recent Leads</h2>
            <p className="text-xs text-muted-foreground">Latest customer acquisitions</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="input-gamma text-xs py-1.5 pl-8 pr-3 w-32" placeholder="Filter..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-gamma">
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
              {analytics.recentLeads.slice(0, 5).map((lead: any) => (
                <tr key={lead.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{lead.name?.charAt(0)}</div>
                      <span className="text-foreground font-medium">{lead.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{lead.number}</td>
                  <td><span className="status-pill active">Firebase</span></td>
                  <td className="text-muted-foreground">{lead.createdAt ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                  <td><span className="flex items-center gap-1.5"><span className="glow-dot" /> New</span></td>
                </tr>
              ))}
              {sheetLeads.slice(0, 3).map((lead: any, idx: number) => (
                <tr key={`sh-${idx}`}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-violet-500/10 flex items-center justify-center text-xs font-bold text-violet-400">{lead.name?.charAt(0)}</div>
                      <span className="text-foreground font-medium">{lead.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{lead.number}</td>
                  <td><span className="status-pill" style={{ background: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))' }}>Sheets</span></td>
                  <td className="text-muted-foreground">{lead.timestamp || 'N/A'}</td>
                  <td className="text-muted-foreground">Pending</td>
                </tr>
              ))}
              {analytics.recentLeads.length === 0 && sheetLeads.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No leads discovered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default GammaDashboard;
