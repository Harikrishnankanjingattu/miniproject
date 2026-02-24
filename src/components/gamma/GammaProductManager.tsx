import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, X, Package, Cloud, AlertCircle, Tag, FileText, DollarSign } from 'lucide-react';
import { readProductsFromGoogleSheets, writeToGoogleSheetsAPI } from '../../services/googleSheets';

const GammaProductManager = ({ user, userProfile, googleToken, onGoogleAuth }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({ name: '', details: '', price: '', offeredPrice: '' });
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [status, setStatus] = useState<{ type: string; msg: string }>({ type: '', msg: '' });

  useEffect(() => { if (googleToken) fetchProducts(); }, [googleToken]);

  const fetchProducts = async () => {
    setLoading(true);
    setProducts(await readProductsFromGoogleSheets(googleToken));
    setLoading(false);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({ name: product.name, details: product.details, price: product.price, offeredPrice: product.offeredPrice });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) { setStatus({ type: 'error', msg: 'Name and Price required' }); return; }
    if (!googleToken) { setStatus({ type: 'error', msg: 'Google session expired' }); return; }
    setLoading(true);
    const rowIndex = editingProduct ? parseInt(editingProduct.id.split('-')[1]) + 2 : null;
    const result = await writeToGoogleSheetsAPI({
      sheetName: 'Products', action: editingProduct ? 'UPDATE' : 'ADD', row: rowIndex,
      data: [formData.name, formData.details, formData.price, formData.offeredPrice, new Date().toISOString()]
    }, googleToken);
    if (result.success) {
      setStatus({ type: 'success', msg: editingProduct ? 'Updated!' : 'Added!' });
      setFormData({ name: '', details: '', price: '', offeredPrice: '' }); setEditingProduct(null);
      setTimeout(() => { setShowModal(false); fetchProducts(); setStatus({ type: '', msg: '' }); }, 1000);
    } else {
      setStatus({ type: 'error', msg: 'Failed to sync' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="section-title text-foreground">Inventory Hub</h1>
            <p className="section-subtitle">Manage products & pricing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button className={`p-2 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/30'}`} onClick={() => setViewMode('grid')}><LayoutGrid size={16} /></button>
            <button className={`p-2 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/30'}`} onClick={() => setViewMode('list')}><List size={16} /></button>
          </div>
          <button className="btn-gamma text-sm flex items-center gap-1.5" onClick={() => { setEditingProduct(null); setFormData({ name: '', details: '', price: '', offeredPrice: '' }); setShowModal(true); }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {googleToken ? (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
          <Cloud size={14} /> Real-time API Sync: Active
        </div>
      ) : (
        <div className="glass-card p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium">Authorization Required</p>
            <p className="text-xs text-muted-foreground mt-0.5">Connect Google Sheets to manage products.</p>
            <button className="btn-gamma text-xs mt-2 py-1.5 px-3" onClick={onGoogleAuth}><Cloud size={12} className="inline mr-1" /> Connect</button>
          </div>
        </div>
      )}

      {loading && !products.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Syncing...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p>No products found</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {products.map(p => (
            <div key={p.id} className="glass-card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.details}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {p.offeredPrice ? (
                  <>
                    <span className="text-lg font-bold font-display text-primary">${p.offeredPrice}</span>
                    <span className="text-sm text-muted-foreground line-through">${p.price}</span>
                  </>
                ) : (
                  <span className="text-lg font-bold font-display text-primary">${p.price}</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                <span className="text-[10px] text-muted-foreground">#INV-{Math.floor(Math.random() * 9000) + 1000}</span>
                <button className="text-xs text-primary hover:underline" onClick={() => handleEdit(p)}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-foreground text-lg">{editingProduct ? 'Edit' : 'Add'} Product</h2>
              <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground" onClick={() => { setShowModal(false); setEditingProduct(null); }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block flex items-center gap-1"><Tag size={12} /> Name</label>
                <input className="input-gamma" placeholder="Product name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block flex items-center gap-1"><FileText size={12} /> Details</label>
                <textarea className="input-gamma min-h-[70px] resize-none" placeholder="Description..." value={formData.details} onChange={e => setFormData(p => ({ ...p, details: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block flex items-center gap-1"><DollarSign size={12} /> Price</label>
                  <input type="number" className="input-gamma" placeholder="0.00" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block flex items-center gap-1"><Tag size={12} /> Offer Price</label>
                  <input type="number" className="input-gamma" placeholder="0.00" value={formData.offeredPrice} onChange={e => setFormData(p => ({ ...p, offeredPrice: e.target.value }))} />
                </div>
              </div>
              {status.msg && <div className={status.type === 'success' ? 'message-success' : status.type === 'error' ? 'message-error' : 'message-info'}>{status.msg}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" className="flex-1 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-secondary/30" onClick={() => { setShowModal(false); setEditingProduct(null); }}>Cancel</button>
                <button type="submit" className="flex-1 btn-gamma text-sm" disabled={loading}>{loading ? 'Processing...' : editingProduct ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GammaProductManager;
