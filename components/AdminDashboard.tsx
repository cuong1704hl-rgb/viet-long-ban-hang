import React, { useState } from 'react';
import type { Product, Order, OrderStatus } from '../types';

interface AdminDashboardProps {
    products: Product[];
    orders: Order[];
    onAddProduct: (product: Omit<Product, 'id'>) => void;
    onUpdateProduct: (id: string, updates: Partial<Product>) => void;
    onDeleteProduct: (id: string) => void;
    onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
    onExportOrders: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    products,
    orders,
    onAddProduct,
    onUpdateProduct,
    onDeleteProduct,
    onUpdateOrderStatus,
    onExportOrders
}) => {
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // New product form state
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        category: '',
        stock: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const productData = {
            name: formData.name,
            price: parseFloat(formData.price),
            description: formData.description,
            image: formData.image,
            category: formData.category,
            stock: parseInt(formData.stock)
        };

        if (editingProduct) {
            onUpdateProduct(editingProduct.id, productData);
        } else {
            onAddProduct(productData);
        }

        // Reset form
        setFormData({ name: '', price: '', description: '', image: '', category: '', stock: '' });
        setShowAddProduct(false);
        setEditingProduct(null);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            description: product.description,
            image: product.image,
            category: product.category,
            stock: product.stock.toString()
        });
        setShowAddProduct(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-500">Quản lý sản phẩm và đơn hàng</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'products'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        📦 Sản phẩm ({products.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        📋 Đơn hàng ({orders.length})
                    </button>
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        {/* Add Product Button */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">Quản lý sản phẩm</h2>
                            <button
                                onClick={() => {
                                    setShowAddProduct(true);
                                    setEditingProduct(null);
                                    setFormData({ name: '', price: '', description: '', image: '', category: '', stock: '' });
                                }}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                <span>➕</span> Thêm sản phẩm
                            </button>
                        </div>

                        {/* Add/Edit Product Form */}
                        {showAddProduct && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h3 className="text-xl font-bold mb-4">
                                    {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                                </h3>
                                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Tên sản phẩm</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Giá (VNĐ)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                            rows={3}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">URL hình ảnh</label>
                                        <input
                                            type="url"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            required
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Danh mục</label>
                                        <input
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Số lượng</label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2 flex gap-3">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                                        >
                                            {editingProduct ? 'Cập nhật' : 'Thêm'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddProduct(false);
                                                setEditingProduct(null);
                                            }}
                                            className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Products List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">{product.description}</p>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-indigo-600 font-bold">{formatCurrency(product.price)}</span>
                                            <span className="text-sm text-slate-500">Kho: {product.stock}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="flex-1 bg-indigo-50 text-indigo-600 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-all"
                                            >
                                                ✏️ Sửa
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Xóa sản phẩm này?')) {
                                                        onDeleteProduct(product.id);
                                                    }
                                                }}
                                                className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-bold hover:bg-red-100 transition-all"
                                            >
                                                🗑️ Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">Quản lý đơn hàng</h2>
                            <button
                                onClick={onExportOrders}
                                className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                📊 Export Excel
                            </button>
                        </div>

                        {/* Orders Table */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Mã đơn</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Khách hàng</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Tổng tiền</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Trạng thái</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Ngày</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono text-sm">{order.id.slice(0, 8)}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{order.userName}</div>
                                                <div className="text-sm text-slate-500">{order.userEmail || order.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-indigo-600">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                                    className="px-3 py-1 rounded-lg border border-slate-300 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                                >
                                                    <option value="Chờ xử lý">Chờ xử lý</option>
                                                    <option value="Đang xử lý">Đang xử lý</option>
                                                    <option value="Đang giao">Đang giao</option>
                                                    <option value="Hoàn thành">Hoàn thành</option>
                                                    <option value="Đã hủy">Đã hủy</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
