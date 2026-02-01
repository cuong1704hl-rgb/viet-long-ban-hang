
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout, cartCount }) => {
  return (
    <nav className="glass sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div
            className="flex items-center cursor-pointer group space-x-3"
            onClick={() => onNavigate('home')}
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform duration-300 overflow-hidden">
              <img src="/logo_vietlong.png" alt="Viet Long Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent uppercase">
                CÔNG TY VIỆT LONG
              </span>
              <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold max-w-[200px] leading-tight">
                Phiên bản phòng kế hoạch kỹ thuật thử nghiệm
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            {['home', 'products', 'deals'].map((item) => (
              <button
                key={item}
                onClick={() => onNavigate(item)}
                className="text-slate-500 hover:text-indigo-600 font-semibold text-sm transition-colors relative group py-2"
              >
                {item === 'home' ? 'Trang chủ' : item === 'products' ? 'Sản phẩm' : 'Ưu đãi'}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
            {user?.role === 'admin' && (
              <button onClick={() => onNavigate('admin')} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all">
                Quản trị
              </button>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-4 ring-white shadow-sm animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center space-x-3 p-1 pr-3 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt="avatar" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{user.role === 'admin' ? 'ADMIN' : 'MEMBER'}</p>
                  </div>
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Đăng xuất"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all active:scale-95"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
