import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, X, Package, Cloud, AlertCircle, Tag, FileText, DollarSign } from 'lucide-react';
import { readProductsFromGoogleSheets, writeToGoogleSheetsAPI } from '../services/googleSheets';
import '../styles/ProductManager.css';

const ProductManager = ({ user, userProfile, googleToken, onGoogleAuth }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [formData, setFormData] = useState({
        name: '',
        details: '',
        price: '',
        offeredPrice: ''
    });
    const [editingProduct, setEditingProduct] = useState(null);
    const [status, setStatus] = useState({ type: '', msg: '' });

    const APPS_SCRIPT_URL = userProfile?.googleAppsScriptUrl || '';

    useEffect(() => {
        if (googleToken) {
            fetchProducts();
        }
    }, [googleToken]);

    const fetchProducts = async () => {
        setLoading(true);
        const data = await readProductsFromGoogleSheets(googleToken);
        setProducts(data);
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            details: product.details,
            price: product.price,
            offeredPrice: product.offeredPrice
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) {
            setStatus({ type: 'error', msg: 'Name and Price are required' });
            return;
        }

        if (!googleToken) {
            setStatus({ type: 'error', msg: 'Google session expired. Please reconnect below.' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', msg: editingProduct ? 'Updating product...' : 'Saving to Google Sheets...' });

        const rowIndex = editingProduct ? parseInt(editingProduct.id.split('-')[1]) + 2 : null;

        const payload = {
            sheetName: 'Products',
            action: editingProduct ? 'UPDATE' : 'ADD',
            row: rowIndex,
            data: [
                formData.name,
                formData.details,
                formData.price,
                formData.offeredPrice,
                new Date().toISOString()
            ]
        };

        const result = await writeToGoogleSheetsAPI(payload, googleToken);

        if (result.success) {
            setStatus({ type: 'success', msg: editingProduct ? 'Product updated!' : 'Product added!' });
            setFormData({ name: '', details: '', price: '', offeredPrice: '' });
            setEditingProduct(null);
            setTimeout(() => {
                setShowModal(false);
                fetchProducts();
                setStatus({ type: '', msg: '' });
            }, 1500);
        } else {
            setStatus({ type: 'error', msg: 'Failed to sync. Check Google Permission.' });
        }
        setLoading(false);
    };

    return (
        <div className="product-manager reveal-up">
            <header className="pm-header reveal-up delay-1">
                <div className="pm-title">
                    <div className="pm-icon-wrap">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1>Inventory Hub</h1>
                        <p>Manage your products and synchronized pricing</p>
                    </div>
                </div>
                <div className="pm-actions">
                    <div className="view-toggle">
                        <button
                            className={viewMode === 'grid' ? 'active' : ''}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button className="add-btn" onClick={() => { setEditingProduct(null); setFormData({ name: '', details: '', price: '', offeredPrice: '' }); setShowModal(true); }}>
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>
            </header>

            {googleToken ? (
                <div className="pm-status-badge connected reveal-up delay-2">
                    <Cloud size={16} />
                    <span>Real-time API Sync: Active</span>
                </div>
            ) : (
                <div className="pm-alert warning connection-prompt reveal-up delay-2">
                    <div className="alert-content">
                        <AlertCircle size={24} />
                        <div>
                            <p><strong>Connection Required:</strong> Please authorize Google Sheets to view and manage your products.</p>
                            <button className="auth-now-btn" onClick={onGoogleAuth}>
                                <Cloud size={16} /> Connect Google Sheets Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className={`pm-content ${viewMode} reveal-up delay-3`}>
                {loading && products.length === 0 ? (
                    <div className="pm-loading">
                        <div className="spinner"></div>
                        <p>Syncing with Google Sheets...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="pm-empty">
                        <Package size={64} strokeWidth={1} />
                        <h2>No Products Found</h2>
                        <p>Start by adding your first product to the inventory.</p>
                        <button className="add-btn" onClick={() => setShowModal(true)}>Add Product Now</button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'pm-grid' : 'pm-list'}>
                        {products.map((product) => (
                            <div key={product.id} className="product-card glass-effect">
                                <div className="product-info">
                                    <div className="product-main">
                                        <h3>{product.name}</h3>
                                        <p>{product.details}</p>
                                    </div>
                                    <div className="product-pricing">
                                        {product.offeredPrice ? (
                                            <>
                                                <span className="current-price">${product.offeredPrice}</span>
                                                <span className="old-price">${product.price}</span>
                                            </>
                                        ) : (
                                            <span className="current-price">${product.price}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="product-meta">
                                    <span className="sku-tag">#INV-{Math.floor(Math.random() * 9000) + 1000}</span>
                                    <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {showModal && (
                <div className="pm-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="pm-modal-content glass-effect" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button className="close-btn" onClick={() => { setShowModal(false); setEditingProduct(null); }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="pm-form">
                            <div className="form-group">
                                <label><Tag size={14} /> Product Name</label>
                                <input
                                    name="name"
                                    placeholder="e.g. Premium Subscription"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><FileText size={14} /> Product Details</label>
                                <textarea
                                    name="details"
                                    placeholder="Describe the product features..."
                                    value={formData.details}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label><DollarSign size={14} /> Normal Price</label>
                                    <input
                                        name="price"
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Tag size={14} /> Offered Price (Optional)</label>
                                    <input
                                        name="offeredPrice"
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.offeredPrice}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {status.msg && (
                                <div className={`status-msg ${status.type}`}>
                                    {status.msg}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => { setShowModal(false); setEditingProduct(null); }}>Cancel</button>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Processing...' : editingProduct ? 'Update Product' : 'Sync Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManager;
