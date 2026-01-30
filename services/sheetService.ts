
import { Product, Order, OrderStatus } from '../types';

/**
 * VIỆT LONG GOOGLE SHEETS SERVICE
 * ================================
 * Service layer để giao tiếp với Google Sheets qua Apps Script Web App API
 * 
 * Features:
 * - Real-time sync với Google Sheets
 * - Automatic caching trong localStorage
 * - Retry mechanism khi network fail
 * - Offline mode support
 */

// Lấy Web App URL từ environment variable
const SHEETS_URL = import.meta.env.VITE_SHEETS_URL || '';
const USE_MOCK = !SHEETS_URL; // Fallback về mock nếu chưa config

// Cache keys
const CACHE_KEYS = {
  PRODUCTS: 'vietlong_products_cache',
  ORDERS: 'vietlong_orders_cache',
  LAST_SYNC: 'vietlong_last_sync'
};

// Mock data fallback
const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'iPhone 15 Pro Max', price: 29900000, description: 'Thiết kế Titan, chip A17 Pro siêu mạnh mẽ.', image: 'https://picsum.photos/seed/iphone/600/600', category: 'Điện thoại', stock: 10 },
  { id: '2', name: 'MacBook Pro M3', price: 39900000, description: 'Hiệu năng đỉnh cao, màn hình Liquid Retina XDR.', image: 'https://picsum.photos/seed/macbook/600/600', category: 'Laptop', stock: 5 },
  { id: '3', name: 'AirPods Pro 2', price: 5900000, description: 'Chống ồn chủ động gấp 2 lần.', image: 'https://picsum.photos/seed/airpods/600/600', category: 'Phụ kiện', stock: 20 },
  { id: '4', name: 'Apple Watch Series 9', price: 9900000, description: 'Cảm biến sức khỏe tiên tiến nhất.', image: 'https://picsum.photos/seed/watch/600/600', category: 'Phụ kiện', stock: 15 },
  { id: '5', name: 'iPad Air M2', price: 16900000, description: 'Mỏng nhẹ, mạnh mẽ với chip M2.', image: 'https://picsum.photos/seed/ipad/600/600', category: 'Máy tính bảng', stock: 8 },
  { id: '6', name: 'Samsung Galaxy S24 Ultra', price: 27900000, description: 'Bút S-Pen tích hợp, camera 200MP.', image: 'https://picsum.photos/seed/samsung/600/600', category: 'Điện thoại', stock: 12 },
  { id: '7', name: 'Dell XPS 15', price: 35900000, description: 'Laptop cao cấp cho dân chuyên nghiệp.', image: 'https://picsum.photos/seed/dell/600/600', category: 'Laptop', stock: 7 },
  { id: '8', name: 'Sony WH-1000XM5', price: 7900000, description: 'Tai nghe chống ồn hàng đầu thế giới.', image: 'https://picsum.photos/seed/sony/600/600', category: 'Phụ kiện', stock: 25 }
];

/**
 * Fetch with retry mechanism
 */
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries reached');
}

/**
 * Service object
 */
export const sheetService = {
  /**
   * Lấy danh sách sản phẩm từ Google Sheets
   */
  getProducts: async (): Promise<Product[]> => {
    // Fallback to mock if not configured
    if (USE_MOCK) {
      console.warn('⚠️ Using MOCK data. Configure VITE_SHEETS_URL in .env.local');
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_PRODUCTS), 800);
      });
    }

    try {
      const response = await fetchWithRetry(`${SHEETS_URL}?action=getProducts`);
      const products = await response.json();

      // Cache data
      localStorage.setItem(CACHE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());

      return products;
    } catch (error) {
      console.error('❌ Failed to fetch products from Sheets:', error);

      // Return cached data if available
      const cached = localStorage.getItem(CACHE_KEYS.PRODUCTS);
      if (cached) {
        console.log('📦 Using cached products data');
        return JSON.parse(cached);
      }

      // Last resort: mock data
      console.log('🔄 Falling back to mock data');
      return MOCK_PRODUCTS;
    }
  },

  /**
   * Lấy danh sách đơn hàng từ Google Sheets
   */
  getOrders: async (): Promise<Order[]> => {
    // Fallback to localStorage if not configured
    if (USE_MOCK) {
      const saved = localStorage.getItem('sge_orders');
      return saved ? JSON.parse(saved) : [];
    }

    try {
      const response = await fetchWithRetry(`${SHEETS_URL}?action=getOrders`);
      const orders = await response.json();

      // Cache data
      localStorage.setItem(CACHE_KEYS.ORDERS, JSON.stringify(orders));

      return orders;
    } catch (error) {
      console.error('❌ Failed to fetch orders from Sheets:', error);

      // Return cached data
      const cached = localStorage.getItem(CACHE_KEYS.ORDERS);
      if (cached) {
        console.log('📦 Using cached orders data');
        return JSON.parse(cached);
      }

      return [];
    }
  },

  /**
   * Lưu đơn hàng mới vào Google Sheets
   */
  saveOrder: async (order: Order): Promise<boolean> => {
    // Fallback to localStorage if not configured
    if (USE_MOCK) {
      const orders = await sheetService.getOrders();
      orders.push(order);
      localStorage.setItem('sge_orders', JSON.stringify(orders));
      return true;
    }

    try {
      await fetchWithRetry(SHEETS_URL, {
        method: 'POST',
        body: JSON.stringify(order)
      });

      console.log('✅ Order saved to Google Sheets:', order.id);

      // Update cache
      const orders = await sheetService.getOrders();
      orders.push(order);
      localStorage.setItem(CACHE_KEYS.ORDERS, JSON.stringify(orders));

      return true;
    } catch (error) {
      console.error('❌ Failed to save order to Sheets:', error);

      // Save to localStorage as backup
      const orders = await sheetService.getOrders();
      orders.push(order);
      localStorage.setItem('sge_orders_pending', JSON.stringify(orders));

      throw new Error('Không thể kết nối Google Sheets. Đơn hàng đã được lưu tạm thời.');
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<boolean> => {
    // Fallback to localStorage if not configured
    if (USE_MOCK) {
      const orders = await sheetService.getOrders();
      const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
      localStorage.setItem('sge_orders', JSON.stringify(updated));
      return true;
    }

    try {
      await fetchWithRetry(SHEETS_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'updateOrder',
          orderId,
          status
        })
      });

      console.log(`✅ Order ${orderId} updated to ${status}`);

      // Update cache
      const orders = await sheetService.getOrders();
      const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
      localStorage.setItem(CACHE_KEYS.ORDERS, JSON.stringify(updated));

      return true;
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      throw new Error('Không thể cập nhật trạng thái đơn hàng.');
    }
  },

  /**
   * Kiểm tra trạng thái kết nối
   */
  checkConnection: async (): Promise<boolean> => {
    if (USE_MOCK) return false;

    try {
      await fetchWithRetry(`${SHEETS_URL}?action=getProducts`, {}, 1);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Lấy thời gian sync cuối cùng
   */
  getLastSyncTime: (): string | null => {
    return localStorage.getItem(CACHE_KEYS.LAST_SYNC);
  }
};
