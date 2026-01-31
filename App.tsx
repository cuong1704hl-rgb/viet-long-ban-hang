
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, Product, Order, User, CartItem, OrderStatus } from './types';
import { localService } from './services/localService';
import { authService } from './services/authService';
import { excelService } from './services/excelService';
import Navbar from './components/Navbar';
import AIChat from './components/AIChat';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerDashboard } from './components/CustomerDashboard';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    products: [],
    orders: [],
    currentUser: null,
    cart: [],
    isSheetSynced: false,
    users: [], // New state to hold list of users for admin
  });
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const products = localService.getProducts();
        const orders = localService.getOrders();

        // Check for existing auth session
        const currentUser = authService.getCurrentUser();
        const isAdmin = authService.isAdmin();

        setState(prev => ({
          ...prev,
          products,
          orders,
          currentUser,
          isSheetSynced: true,
          users: isAdmin ? localService.getUsers() : [] // Fetch users if admin
        }));

        setIsAdmin(isAdmin);
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };
    init();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(state.products.map(p => p.category)));
    return ['Tất cả', ...cats];
  }, [state.products]);

  const filteredProducts = useMemo(() => {
    return state.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Tất cả' || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.products, searchTerm, activeCategory]);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    // Refresh user state
    const currentUser = authService.getCurrentUser();
    const isAdmin = authService.isAdmin();

    setState(prev => ({
      ...prev,
      currentUser,
      users: isAdmin ? localService.getUsers() : []
    }));
    setIsAdmin(isAdmin);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    authService.logout();
    setState(prev => ({ ...prev, currentUser: null }));
    setIsAdmin(false);
    setCurrentPage('home');
  };

  const addToCart = (product: Product) => {
    setState(prev => {
      const existing = prev.cart.find(item => item.id === product.id);
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        };
      }
      return { ...prev, cart: [...prev.cart, { ...product, quantity: 1 }] };
    });
  };

  const buyAgain = (items: CartItem[]) => {
    setState(prev => {
      let newCart = [...prev.cart];
      items.forEach(orderItem => {
        const existing = newCart.find(c => c.id === orderItem.id);
        if (existing) {
          newCart = newCart.map(c => c.id === orderItem.id ? { ...c, quantity: c.quantity + orderItem.quantity } : c);
        } else {
          newCart.push({ ...orderItem });
        }
      });
      return { ...prev, cart: newCart };
    });
    setCurrentPage('cart');
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    }));
  };

  const removeFromCart = (id: string) => {
    setState(prev => ({ ...prev, cart: prev.cart.filter(i => i.id !== id) }));
  };

  const placeOrder = async (address: string, phone: string) => {
    if (!state.currentUser || state.cart.length === 0) return;

    const newOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      userEmail: state.currentUser.email,
      items: [...state.cart],
      total: state.cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0),
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      address,
      phone
    };

    localService.saveOrder(newOrder);
    const updatedOrders = localService.getOrders();
    setState(prev => ({ ...prev, cart: [], orders: updatedOrders }));
    setCurrentPage('profile');
  };

  const updateOrder = async (id: string, status: OrderStatus) => {
    localService.updateOrderStatus(id, status);
    const updatedOrders = localService.getOrders();
    setState(prev => ({ ...prev, orders: updatedOrders }));
  };

  const getStatusProgress = (status: OrderStatus) => {
    const steps = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.COMPLETED];
    if (status === OrderStatus.CANCELLED) return null;
    return steps.indexOf(status);
  };

  // Admin product handlers
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      id: 'P-' + Date.now(),
      ...productData
    };
    const updatedProducts = localService.saveProduct(newProduct);
    setState(prev => ({ ...prev, products: updatedProducts }));
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    const updatedProducts = localService.updateProduct(id, updates);
    setState(prev => ({ ...prev, products: updatedProducts }));
  };

  const handleDeleteProduct = async (id: string) => {
    const updatedProducts = localService.deleteProduct(id);
    setState(prev => ({ ...prev, products: updatedProducts }));
  };

  const handleExportOrders = () => {
    excelService.exportOrdersToExcel(state.orders, 'vietlong-orders');
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    if (!state.currentUser) return;
    const updatedUser = { ...state.currentUser, ...updates };
    setState(prev => ({ ...prev, currentUser: updatedUser }));
    // TODO: Call API to update user in Google Sheets
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = localService.deleteUser(id);
    setState(prev => ({ ...prev, users: updatedUsers }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-slate-100 rounded-full"></div>
          <div className="w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
        </div>
        <p className="mt-8 text-slate-900 font-extrabold text-2xl tracking-tighter animate-pulse">SGE STORE</p>
        <p className="mt-2 text-slate-400 font-medium text-sm">Syncing with Google Sheets Cloud...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar
        user={state.currentUser}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        cartCount={state.cart.reduce((a, b) => a + b.quantity, 0)}
      />

      {/* Customer Dashboard */}
      {state.currentUser && !isAdmin && currentPage === 'profile' ? (
        <CustomerDashboard
          user={state.currentUser}
          orders={state.orders}
          onUpdateProfile={handleUpdateProfile}
        />
      ) : isAdmin && currentPage === 'admin' ? (
        <AdminDashboard
          products={state.products}
          orders={state.orders}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={updateOrder}
          onExportOrders={handleExportOrders}
          onLogout={handleLogout}
          users={state.users}
          onDeleteUser={handleDeleteUser}
        />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {(currentPage === 'home' || currentPage === 'products' || currentPage === 'deals') && (
            <section className="animate-fade-in-up">
              <div className="mb-16 flex flex-col items-center text-center">
                <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 animate-float">
                  New Generation 2024
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                  Kiến tạo tương lai <br />
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent italic">với công nghệ đỉnh cao</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium mb-10">
                  Khám phá bộ sưu tập thiết bị cao cấp nhất, cập nhật thời gian thực từ hệ thống kho dữ liệu đám mây.
                </p>

                {/* Advanced Search & Filter Bar */}
                <div className="w-full max-w-4xl mx-auto mb-16 space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm, thương hiệu hoặc tính năng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-16 pr-6 py-6 bg-white border border-slate-200 rounded-[2rem] text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all shadow-xl shadow-slate-100/50"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-6 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105'
                          : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-200 hover:text-indigo-500'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map((product, idx) => (
                    <div
                      key={product.id}
                      className={`product-card bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm animate-fade-in-up stagger-${(idx % 5) + 1}`}
                    >
                      <div className="aspect-[4/5] overflow-hidden bg-slate-50 relative group">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-4 right-4">
                          <button className="bg-white/80 backdrop-blur-md p-2 rounded-xl text-slate-400 hover:text-red-500 transition-colors shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 px-3 py-1 bg-indigo-50 rounded-lg">
                            {product.category}
                          </span>
                          <span className="text-xs font-bold text-slate-400">STOCK: {product.stock}</span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10 font-medium">{product.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <span className="text-2xl font-black text-slate-900">{(product.price).toLocaleString('vi-VN')} đ</span>
                          <button
                            onClick={() => addToCart(product)}
                            className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 hover:scale-110 active:scale-95"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 animate-fade-in-up">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-slate-400 font-bold mb-8">Chúng tôi không tìm thấy kết quả phù hợp với "{searchTerm}"</p>
                  <button
                    onClick={() => { setSearchTerm(''); setActiveCategory('Tất cả'); }}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              )}
            </section>
          )}

          {currentPage === 'cart' && (
            <div className="max-w-4xl mx-auto animate-fade-in-up">
              <h2 className="text-4xl font-extrabold mb-10 text-slate-900 flex items-center">
                <span className="w-12 h-12 bg-indigo-600 rounded-2xl text-white flex items-center justify-center mr-4 shadow-lg shadow-indigo-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </span>
                Giỏ hàng
              </h2>
              {state.cart.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 4-8-4" />
                    </svg>
                  </div>
                  <p className="text-slate-400 mb-8 font-bold text-lg">Giỏ hàng của bạn đang trống.</p>
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                  >
                    Mua sắm ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-4">
                    {state.cart.map(item => (
                      <div key={item.id} className="flex flex-col sm:flex-row items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm gap-6 hover:shadow-md transition-shadow">
                        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-extrabold text-slate-900 text-xl">{item.name}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{item.category}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                              <button onClick={() => updateCartQuantity(item.id, -1)} className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center transition-colors text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-10 text-center font-black text-slate-900">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.id, 1)} className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center transition-colors text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                            <p className="font-black text-indigo-600 text-lg">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-indigo-100/20 h-fit">
                    <h3 className="text-2xl font-black mb-8 text-slate-900">Chi tiết thanh toán</h3>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between font-bold text-slate-500">
                        <span>Tạm tính</span>
                        <span>{state.cart.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-500">
                        <span>Vận chuyển</span>
                        <span className="text-green-500">FREE</span>
                      </div>
                      <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-3xl font-black text-slate-900">
                        <span>Tổng</span>
                        <span className="text-indigo-600">{state.cart.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>

                    {state.currentUser ? (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        placeOrder(formData.get('address') as string, formData.get('phone') as string);
                      }} className="space-y-6">
                        <div className="space-y-4">
                          <input name="phone" required placeholder="Số điện thoại" className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition-all" />
                          <input name="address" required placeholder="Địa chỉ giao hàng" className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition-all" />
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-600 shadow-xl transition-all active:scale-95">
                          Xác nhận đơn hàng
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-center font-bold text-slate-400">Vui lòng đăng nhập để thanh toán</p>
                        <button onClick={() => setCurrentPage('login')} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100">
                          Đăng nhập ngay
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentPage === 'profile' && state.currentUser && (
            <div className="animate-fade-in-up max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Trung tâm khách hàng</h2>
                  <p className="text-slate-500 font-medium">Xin chào, <span className="text-indigo-600 font-bold">{state.currentUser.name}</span>. Theo dõi các đơn hàng của bạn tại đây.</p>
                </div>
                <button onClick={handleLogout} className="flex items-center space-x-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-100 transition-all">
                  <span>Đăng xuất</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-10">
                {state.orders.filter(o => o.userId === state.currentUser?.id).length === 0 ? (
                  <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 text-slate-400 font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Bạn chưa có đơn hàng nào.
                  </div>
                ) : (
                  state.orders.filter(o => o.userId === state.currentUser?.id).reverse().map(order => {
                    const progressIdx = getStatusProgress(order.status);
                    const isCancelled = order.status === OrderStatus.CANCELLED;
                    const steps = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.COMPLETED];

                    return (
                      <div key={order.id} className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 transition-all duration-500 group-hover:w-3"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">Mã: {order.id}</span>
                              <span className="text-xs font-bold text-slate-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Chi tiết đơn hàng</h3>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`px-6 py-2 rounded-2xl text-sm font-black uppercase tracking-widest mb-2 shadow-sm ${order.status === OrderStatus.COMPLETED ? 'bg-emerald-500 text-white' :
                              order.status === OrderStatus.CANCELLED ? 'bg-rose-500 text-white' :
                                'bg-indigo-600 text-white'
                              }`}>{order.status}</span>
                            <span className="text-2xl font-black text-indigo-600">{(order.total).toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>

                        {/* Status Tracker */}
                        {!isCancelled && (
                          <div className="mb-12">
                            <div className="flex justify-between relative">
                              {/* Connector Line */}
                              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                              <div
                                className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-1000"
                                style={{ width: `${(progressIdx! / (steps.length - 1)) * 100}%` }}
                              ></div>

                              {steps.map((step, idx) => (
                                <div key={step} className="relative z-10 flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${idx <= progressIdx!
                                    ? 'bg-indigo-600 border-white text-white shadow-lg shadow-indigo-100 scale-110'
                                    : 'bg-white border-slate-100 text-slate-200'
                                    }`}>
                                    {idx < progressIdx! ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <span className="text-[10px] font-black">{idx + 1}</span>
                                    )}
                                  </div>
                                  <span className={`absolute -bottom-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${idx <= progressIdx! ? 'text-indigo-600' : 'text-slate-300'
                                    }`}>
                                    {step}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-16 pt-10 border-t border-slate-50">
                          {/* Items Section */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Sản phẩm đã mua</h4>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-4 bg-slate-50/50 p-4 rounded-3xl group/item hover:bg-white hover:shadow-md transition-all">
                                <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                                  <img src={item.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-extrabold text-slate-900 line-clamp-1">{item.name}</p>
                                  <p className="text-xs font-bold text-slate-400 uppercase">{item.category} x {item.quantity}</p>
                                </div>
                                <p className="font-black text-slate-900">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</p>
                              </div>
                            ))}
                          </div>

                          {/* Delivery Info */}
                          <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Thông tin giao hàng</h4>
                            <div className="space-y-6">
                              <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Địa chỉ</p>
                                  <p className="font-bold text-slate-900 text-sm leading-relaxed">{order.address}</p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Điện thoại</p>
                                  <p className="font-bold text-slate-900 text-sm">{order.phone}</p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-10">
                              <button
                                onClick={() => buyAgain(order.items)}
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-slate-200"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                                <span>Mua lại ngay</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {currentPage === 'admin' && state.currentUser?.role === 'admin' && (
            <div className="animate-fade-in-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <h2 className="text-4xl font-extrabold text-slate-900">Hệ thống Quản trị</h2>
                <div className="flex items-center space-x-3 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl border border-emerald-100">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-xs font-black tracking-widest uppercase">Sheets Linked</span>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Khách hàng</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chi tiết</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tổng tiền</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {state.orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-8">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                {order.userName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900">{order.userName}</p>
                                <p className="text-xs font-bold text-slate-400">{order.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-8">
                            <p className="text-sm font-bold text-slate-700">{order.items.length} sản phẩm</p>
                            <p className="text-[10px] font-bold text-slate-400">{order.id}</p>
                          </td>
                          <td className="px-8 py-8">
                            <p className="font-black text-indigo-600 text-lg">{order.total.toLocaleString('vi-VN')} đ</p>
                          </td>
                          <td className="px-8 py-8">
                            <span className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 uppercase tracking-widest">{order.status}</span>
                          </td>
                          <td className="px-8 py-8">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrder(order.id, e.target.value as OrderStatus)}
                              className="bg-white border-2 border-slate-100 text-xs font-bold rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                            >
                              {Object.values(OrderStatus).map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'login' && (
            <div className="max-w-md mx-auto py-24 animate-fade-in-up">
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/30 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl mx-auto flex items-center justify-center text-white text-5xl font-black mb-10 shadow-2xl shadow-indigo-200 animate-float">S</div>
                <h2 className="text-4xl font-black mb-3 text-slate-900 tracking-tighter">Chào mừng</h2>
                <p className="text-slate-400 mb-12 font-bold uppercase text-[10px] tracking-[0.2em]">Chọn phân quyền truy cập</p>

                <div className="space-y-6">
                  <button
                    onClick={() => handleLogin()}
                    className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-indigo-600 shadow-xl shadow-slate-100 transition-all active:scale-95 flex items-center justify-center space-x-3 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Đăng nhập</span>
                  </button>
                  <button
                    onClick={() => handleLogin()}
                    className="w-full bg-white text-slate-900 border-2 border-slate-100 py-5 rounded-[2rem] font-black text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95 flex items-center justify-center space-x-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Đăng ký</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      <AIChat products={state.products} />

      {/* Footer Decoration */}
      <footer className="max-w-7xl mx-auto px-4 py-20 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">S</div>
              <span className="text-xl font-black tracking-tighter">SGE STORE</span>
            </div>
            <p className="text-slate-400 font-medium max-w-sm">Hệ thống bán lẻ thiết bị công nghệ hàng đầu, tiên phong trong ứng dụng AI và điện toán đám mây vào trải nghiệm mua sắm.</p>
          </div>
          <div>
            <h4 className="font-black mb-6 uppercase text-[10px] tracking-widest text-slate-400">Hỗ trợ</h4>
            <ul className="space-y-4 font-bold text-slate-600 text-sm">
              <li><a href="#" className="hover:text-indigo-600">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-indigo-600">Chính sách bảo hành</a></li>
              <li><a href="#" className="hover:text-indigo-600">Vận chuyển & Trả hàng</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-6 uppercase text-[10px] tracking-widest text-slate-400">Social</h4>
            <div className="flex space-x-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
