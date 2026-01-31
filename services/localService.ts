
import { Product, Order, OrderStatus } from '../types';

/**
 * VIỆT LONG LOCAL SERVICE
 * =======================
 * Service layer để quản lý dữ liệu trực tiếp trên trình duyệt (Local Storage)
 * 
 * Features:
 * - CRUD Sản phẩm (Thêm, Sửa, Xóa)
 * - Quản lý Đơn hàng
 * - Dữ liệu được lưu trong LocalStorage của trình duyệt
 * - Không cần kết nối internet hoặc Google Sheets
 */

const STORAGE_KEYS = {
    PRODUCTS: 'vietlong_products_v1',
    ORDERS: 'vietlong_orders_v1'
};

// Dữ liệu mẫu ban đầu nếu chưa có gì
const INITIAL_PRODUCTS: Product[] = [
    { id: '1', name: 'iPhone 15 Pro Max', price: 29900000, description: 'Thiết kế Titan, chip A17 Pro siêu mạnh mẽ.', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800', category: 'Điện thoại', stock: 10 },
    { id: '2', name: 'MacBook Pro M3', price: 39900000, description: 'Hiệu năng đỉnh cao, màn hình Liquid Retina XDR.', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=800', category: 'Laptop', stock: 5 },
    { id: '3', name: 'AirPods Pro 2', price: 5900000, description: 'Chống ồn chủ động gấp 2 lần.', image: 'https://images.unsplash.com/photo-1628202926206-c63a34b1618f?auto=format&fit=crop&q=80&w=800', category: 'Phụ kiện', stock: 20 },
    { id: '4', name: 'Apple Watch Series 9', price: 9900000, description: 'Cảm biến sức khỏe tiên tiến nhất.', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800', category: 'Phụ kiện', stock: 15 },
    { id: '5', name: 'iPad Air M2', price: 16900000, description: 'Mỏng nhẹ, mạnh mẽ với chip M2.', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800', category: 'Máy tính bảng', stock: 8 },
    { id: '6', name: 'Samsung Galaxy S24 Ultra', price: 27900000, description: 'Bút S-Pen tích hợp, camera 200MP.', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800', category: 'Điện thoại', stock: 12 },
    { id: '7', name: 'Dell XPS 15', price: 35900000, description: 'Laptop cao cấp cho dân chuyên nghiệp.', image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&q=80&w=800', category: 'Laptop', stock: 7 },
    { id: '8', name: 'Sony WH-1000XM5', price: 7900000, description: 'Tai nghe chống ồn hàng đầu thế giới.', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800', category: 'Phụ kiện', stock: 25 }
];

export const localService = {
    // --- PRODUCTS ---

    getProducts: (): Product[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
            if (stored) {
                return JSON.parse(stored);
            }
            // Initialize if empty
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
            return INITIAL_PRODUCTS;
        } catch (error) {
            console.error('Error reading products from local storage:', error);
            return [];
        }
    },

    saveProduct: (product: Product): Product[] => {
        try {
            const products = localService.getProducts();
            // Check if ID exists, generate new if collision (snapshot check only)
            const newProducts = [...products, product];
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newProducts));
            return newProducts;
        } catch (error) {
            console.error('Error saving product:', error);
            return [];
        }
    },

    updateProduct: (id: string, updates: Partial<Product>): Product[] => {
        try {
            const products = localService.getProducts();
            const newProducts = products.map(p => p.id === id ? { ...p, ...updates } : p);
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newProducts));
            return newProducts;
        } catch (error) {
            console.error('Error updating product:', error);
            return [];
        }
    },

    deleteProduct: (id: string): Product[] => {
        try {
            const products = localService.getProducts();
            const newProducts = products.filter(p => p.id !== id);
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newProducts));
            return newProducts;
        } catch (error) {
            console.error('Error deleting product:', error);
            return [];
        }
    },

    // --- ORDERS ---

    getOrders: (): Order[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading orders from local storage:', error);
            return [];
        }
    },

    saveOrder: (order: Order): Order[] => {
        try {
            const orders = localService.getOrders();
            const newOrders = [...orders, order];
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
            return newOrders;
        } catch (error) {
            console.error('Error saving order:', error);
            return [];
        }
    },

    updateOrderStatus: (orderId: string, status: OrderStatus): Order[] => {
        try {
            const orders = localService.getOrders();
            const newOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
            return newOrders;
        } catch (error) {
            console.error('Error updating order status:', error);
            return [];
        }
    }
};
