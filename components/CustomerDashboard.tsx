import React, { useState } from 'react';
import type { Order, User, OrderStatus } from '../types';

interface CustomerDashboardProps {
    user: User;
    orders: Order[];
    onUpdateProfile: (updates: Partial<User>) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
    user,
    orders,
    onUpdateProfile
}) => {
    const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user.name,
        phone: user.phone || '',
        email: user.email
    });

    // Filter orders for this customer only
    const myOrders = orders.filter(order => order.userId === user.id);

    const handleSaveProfile = () => {
        onUpdateProfile(profileData);
        setIsEditingProfile(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'Chờ xử lý': return 'bg-yellow-100 text-yellow-700';
            case 'Đang xử lý': return 'bg-blue-100 text-blue-700';
            case 'Đang giao': return 'bg-purple-100 text-purple-700';
            case 'Hoàn thành': return 'bg-green-100 text-green-700';
            case 'Đã hủy': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">
                        Xin chào, {user.name}! 👋
                    </h1>
                    <p className="text-slate-500">Quản lý đơn hàng và thông tin cá nhân của bạn</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                        <div className="text-sm opacity-90 mb-2">Tổng đơn hàng</div>
                        <div className="text-4xl font-black">{myOrders.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                        <div className="text-sm opacity-90 mb-2">Đã hoàn thành</div>
                        <div className="text-4xl font-black">
                            {myOrders.filter(o => o.status === 'Hoàn thành').length}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl p-6 text-white">
                        <div className="text-sm opacity-90 mb-2">Tổng chi tiêu</div>
                        <div className="text-2xl font-black">
                            {formatCurrency(myOrders.reduce((sum, order) => sum + order.total, 0))}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        📦 Đơn hàng của tôi
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'profile'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        👤 Thông tin cá nhân
                    </button>
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        {myOrders.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có đơn hàng nào</h3>
                                <p className="text-slate-500">Hãy khám phá cửa hàng và đặt hàng ngay!</p>
                            </div>
                        ) : (
                            myOrders.map((order) => (
                                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-mono text-sm text-slate-500">#{order.id}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-indigo-600">
                                                {formatCurrency(order.total)}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {order.items.length} sản phẩm
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="border-t border-slate-100 pt-4 space-y-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-slate-900">{item.name}</div>
                                                    <div className="text-sm text-slate-500">
                                                        Số lượng: {item.quantity} × {formatCurrency(item.price)}
                                                    </div>
                                                </div>
                                                <div className="font-bold text-indigo-600">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Delivery Address */}
                                    <div className="border-t border-slate-100 mt-4 pt-4">
                                        <div className="text-sm text-slate-500 mb-1">Địa chỉ giao hàng:</div>
                                        <div className="font-medium text-slate-900">{order.address}</div>
                                        <div className="text-sm text-slate-500 mt-1">SĐT: {order.phone}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Thông tin cá nhân</h2>
                            {!isEditingProfile && (
                                <button
                                    onClick={() => setIsEditingProfile(true)}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all"
                                >
                                    ✏️ Chỉnh sửa
                                </button>
                            )}
                        </div>

                        {isEditingProfile ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Email không thể thay đổi</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                                    >
                                        Lưu thay đổi
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingProfile(false);
                                            setProfileData({ name: user.name, phone: user.phone || '', email: user.email });
                                        }}
                                        className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-black">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-slate-900">{user.name}</div>
                                        <div className="text-sm text-slate-500">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">Email</div>
                                        <div className="font-medium text-slate-900">{user.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">Số điện thoại</div>
                                        <div className="font-medium text-slate-900">{user.phone || 'Chưa cập nhật'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">Ngày tham gia</div>
                                        <div className="font-medium text-slate-900">
                                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">Tổng đơn hàng</div>
                                        <div className="font-medium text-slate-900">{myOrders.length} đơn</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
