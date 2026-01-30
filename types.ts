
export enum OrderStatus {
  PENDING = 'Chờ xử lý',
  PROCESSING = 'Đang xử lý',
  SHIPPED = 'Đang giao',
  COMPLETED = 'Hoàn thành',
  CANCELLED = 'Đã hủy'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  address: string;
  phone: string;
}

export interface AppState {
  products: Product[];
  orders: Order[];
  currentUser: User | null;
  cart: CartItem[];
  isSheetSynced: boolean;
}
