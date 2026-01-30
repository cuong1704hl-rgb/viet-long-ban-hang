import type { User, LoginCredentials, RegisterData } from '../types';

// Fixed admin credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@vietlong.com',
    password: 'admin123', // In production, this should be hashed
    user: {
        id: 'admin-001',
        email: 'admin@vietlong.com',
        name: 'Admin Việt Long',
        role: 'admin' as const,
        createdAt: new Date().toISOString()
    }
};

// Session storage keys
const AUTH_STORAGE_KEY = 'vietlong_auth_user';
const SESSION_EXPIRY_KEY = 'vietlong_auth_expiry';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Simple password hashing (for demo - in production use proper crypto)
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password against hash
async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

export const authService = {
    // Login
    async login(credentials: LoginCredentials): Promise<User> {
        const { email, password } = credentials;

        // Check if admin login
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            this.setSession(ADMIN_CREDENTIALS.user);
            return ADMIN_CREDENTIALS.user;
        }

        // For customer login - call Google Sheets API
        try {
            const SHEETS_URL = import.meta.env.VITE_SHEETS_URL;

            if (!SHEETS_URL) {
                // Fallback: Mock customer for testing
                const mockUser: User = {
                    id: 'customer-001',
                    email,
                    name: 'Mock Customer',
                    role: 'customer',
                    createdAt: new Date().toISOString()
                };
                this.setSession(mockUser);
                return mockUser;
            }

            const response = await fetch(`${SHEETS_URL}?action=loginUser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            if (!data.success || !data.user) {
                throw new Error(data.message || 'Login failed');
            }

            const user = data.user as User;
            this.setSession(user);
            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Email hoặc mật khẩu không đúng');
        }
    },

    // Register new customer
    async register(data: RegisterData): Promise<User> {
        try {
            const SHEETS_URL = import.meta.env.VITE_SHEETS_URL;

            if (!SHEETS_URL) {
                // Fallback: Create mock user
                const mockUser: User = {
                    id: `customer-${Date.now()}`,
                    email: data.email,
                    name: data.name,
                    phone: data.phone,
                    role: 'customer',
                    createdAt: new Date().toISOString()
                };
                this.setSession(mockUser);
                return mockUser;
            }

            // Hash password before sending
            const passwordHash = await hashPassword(data.password);

            const response = await fetch(`${SHEETS_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'registerUser',
                    email: data.email,
                    password: passwordHash,
                    name: data.name,
                    phone: data.phone
                })
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const result = await response.json();
            if (!result.success || !result.user) {
                throw new Error(result.message || 'Registration failed');
            }

            const user = result.user as User;
            this.setSession(user);
            return user;
        } catch (error) {
            console.error('Registration error:', error);
            throw new Error('Đăng ký thất bại. Email có thể đã được sử dụng.');
        }
    },

    // Logout
    logout(): void {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(SESSION_EXPIRY_KEY);
        console.log('✅ Logged out');
    },

    // Get current user from session
    getCurrentUser(): User | null {
        try {
            const userStr = localStorage.getItem(AUTH_STORAGE_KEY);
            const expiryStr = localStorage.getItem(SESSION_EXPIRY_KEY);

            if (!userStr || !expiryStr) {
                return null;
            }

            const expiry = parseInt(expiryStr, 10);
            if (Date.now() > expiry) {
                // Session expired
                this.logout();
                return null;
            }

            return JSON.parse(userStr) as User;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    // Check if user is admin
    isAdmin(): boolean {
        const user = this.getCurrentUser();
        return user?.role === 'admin';
    },

    // Check if user is customer
    isCustomer(): boolean {
        const user = this.getCurrentUser();
        return user?.role === 'customer';
    },

    // Check if authenticated
    isAuthenticated(): boolean {
        return this.getCurrentUser() !== null;
    },

    // Set session
    setSession(user: User): void {
        const expiry = Date.now() + SESSION_DURATION;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
        console.log('✅ Session set for:', user.email);
    },

    // Hash password utility (exposed for testing)
    hashPassword
};
