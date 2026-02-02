import type { User, LoginCredentials, RegisterData, UserWithPassword } from '../types';
import { firebaseService } from './firebaseService';

// ... (existing imports)

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

export const authService = {
    // Login
    async login(credentials: LoginCredentials): Promise<User> {
        const { email, password } = credentials;

        try {
            // Get users from Firebase
            const users = await firebaseService.getUsers();

            // Find user by email
            const user = users.find(u => u.email === email);
            if (!user) {
                throw new Error('Email không tồn tại');
            }

            // Verify password
            const hashedPassword = await hashPassword(password);

            // Check against stored password
            if (user.password !== hashedPassword) {
                throw new Error('Mật khẩu không đúng');
            }

            // Remove password before returning/storing in session
            const { password: _, ...safeUser } = user;

            this.setSession(safeUser as User);
            return safeUser as User;
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Đăng nhập thất bại');
        }
    },

    // Register new customer
    async register(data: RegisterData): Promise<User> {
        try {
            // Hash password
            const passwordHash = await hashPassword(data.password);

            const newUser: UserWithPassword = {
                id: `u-${Date.now()}`,
                email: data.email,
                name: data.name,
                phone: data.phone,
                role: 'customer',
                createdAt: new Date().toISOString(),
                password: passwordHash
            };

            // Save to Firebase
            await firebaseService.saveUser(newUser);

            // Remove password for session
            const { password: _, ...safeUser } = newUser;
            this.setSession(safeUser as User);

            return safeUser as User;
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Đăng ký thất bại');
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
