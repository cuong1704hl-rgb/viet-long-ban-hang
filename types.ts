
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
  phone?: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

export interface UserWithPassword extends User {
  password?: string; // Hashed password
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
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
  users?: User[] | any[]; // Allow any for flexibility or strictly User[]
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}
