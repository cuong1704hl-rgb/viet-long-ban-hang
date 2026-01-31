import React from 'react';
import { Order, OrderStatus } from '../types';

interface OrderDetailModalProps {
    order: Order | null;
    onClose: () => void;
    onUpdateStatus: (id: string, status: OrderStatus) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onUpdateStatus }) => {
    if (!order) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Chi tiết đơn hàng</h3>
                        <p className="text-slate-400 text-sm font-mono mt-1">{order.id} - {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                    {/* Status & Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Thông tin khách hàng</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                        {order.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{order.userName}</p>
                                        <p className="text-sm text-slate-500">{order.userEmail || 'Chưa có email'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pl-2">
                                    <span className="text-indigo-400">📍</span>
                                    <p className="text-sm text-slate-700 font-medium">{order.address}</p>
                                </div>
                                <div className="flex items-center gap-3 pl-2">
                                    <span className="text-indigo-400">📞</span>
                                    <p className="text-sm text-slate-700 font-medium">{order.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Trạng thái đơn hàng</h4>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <select
                                    value={order.status}
                                    onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="Chờ xử lý">Chờ xử lý</option>
                                    <option value="Đang xử lý">Đang xử lý</option>
                                    <option value="Đang giao">Đang giao</option>
                                    <option value="Hoàn thành">Hoàn thành</option>
                                    <option value="Đã hủy">Đã hủy</option>
                                </select>
                                <div className="mt-4 flex gap-2">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' :
                                        order.status === 'Đã hủy' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products List */}
                    <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Danh sách sản phẩm</h4>
                        <div className="space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900">{item.name}</p>
                                        <p className="text-xs text-slate-500">{item.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-slate-900">x{item.quantity}</p>
                                        <p className="font-bold text-indigo-600">{formatCurrency(item.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-medium text-slate-500">Tổng cộng ({order.items.length} món)</span>
                    <span className="text-2xl font-black text-indigo-600">{formatCurrency(order.total)}</span>
                </div>
            </div>
        </div>
    );
};
