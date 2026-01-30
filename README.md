<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🛍️ Việt Long - Hệ Thống Bán Hàng

Website bán hàng hiện đại **tích hợp Google Sheets** làm database, cho phép quản lý sản phẩm và đơn hàng real-time.

## ✨ Tính Năng

- 🎨 **UI Premium**: Giao diện hiện đại, responsive, animations mượt mà
- 🔄 **Real-time Sync**: Dữ liệu đồng bộ tức thì với Google Sheets
- 📦 **Quản Lý Sản Phẩm**: Thêm/sửa sản phẩm trực tiếp trong Google Sheets
- 🛒 **Giỏ Hàng Thông Minh**: Tự động tính toán, lưu trữ local
- 📊 **Admin Dashboard**: Quản lý đơn hàng, cập nhật trạng thái
- 🤖 **AI Chat Assistant**: Hỗ trợ khách hàng bằng Gemini AI
- 💾 **Offline Mode**: Cache data, hoạt động khi mất kết nối
- 🔒 **Phân Quyền**: Admin và Customer với quyền khác nhau

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Google Account (để tạo Google Sheet)
- Gemini API Key (tùy chọn, cho AI Chat)

### 1. Clone & Install

```bash
# Clone project
cd việt-long-bán-hàng

# Install dependencies
npm install
```

### 2. Cấu Hình Google Sheets

**📖 Xem hướng dẫn chi tiết:** [SETUP-GUIDE.md](./brain/SETUP-GUIDE.md)

**Tóm tắt:**
1. Tạo Google Sheet mới
2. Extensions > Apps Script > Copy code từ `google-sheets-script.gs`
3. Deploy as Web App (Execute as: Me, Access: Anyone)
4. Copy Web App URL

### 3. Environment Variables

```bash
# Copy template
cp .env.example .env.local

# Chỉnh sửa .env.local
VITE_SHEETS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Local

```bash
npm run dev
```

**Mở:** http://localhost:5173

## 📚 Cấu Trúc Project

```
việt-long-bán-hàng/
├── services/
│   ├── sheetService.ts      # Google Sheets API integration
│   └── geminiService.ts     # AI Chat service
├── components/
│   ├── Navbar.tsx           # Navigation bar
│   └── AIChat.tsx           # AI assistant
├── App.tsx                  # Main application
├── types.ts                 # TypeScript definitions
├── .env.example             # Environment variables template
└── google-sheets-script.gs  # Apps Script backend code
```

## 🗄️ Database Schema (Google Sheets)

### Sheet "Products"

| id | name | price | description | image | category | stock |
|----|------|-------|-------------|-------|----------|-------|
| 1 | iPhone 15 | 29900000 | ... | URL | Điện thoại | 10 |

### Sheet "Orders"

| id | userId | userName | items (JSON) | total | status | createdAt | address | phone |
|----|--------|----------|--------------|-------|--------|-----------|---------|-------|
| ORD-ABC | ... | Khách 1 | [{...}] | 29900000 | Chờ xử lý | ISO Date | ... | ... |

## 🔧 Development

```bash
# Development mode với hot-reload
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## 🎯 Sử Dụng

### Khách Hàng
1. **Duyệt sản phẩm** → Tìm kiếm, lọc theo danh mục
2. **Thêm vào giỏ** → Điều chỉnh số lượng
3. **Đăng nhập** → Chọn "Khách hàng"
4. **Checkout** → Nhập địa chỉ, SĐT → Xác nhận
5. **Theo dõi đơn** → Vào Profile xem trạng thái

### Admin
1. **Đăng nhập** → Chọn "Quản trị viên"
2. **Admin Panel** → Xem tất cả đơn hàng
3. **Cập nhật trạng thái** → Dropdown chọn trạng thái mới
4. **Quản lý Sheets** → Mở Google Sheets để sửa sản phẩm

## 🤝 Quản Lý Dữ Liệu

### Thêm Sản Phẩm Mới
1. Mở Google Sheet
2. Vào tab "Products"
3. Thêm dòng mới với đầy đủ cột
4. Refresh website → sản phẩm tự động hiện

### Xem Đơn Hàng
- Tab "Orders" trong Google Sheets
- Mỗi đơn hàng là 1 dòng
- Có thể export sang Excel, tạo biểu đồ

## 🐛 Troubleshooting

### Website vẫn dùng MOCK data
```bash
# Check console xuất hiện:
⚠️ Using MOCK data. Configure VITE_SHEETS_URL in .env.local

# Fix:
# 1. Kiểm tra .env.local có VITE_SHEETS_URL
# 2. Restart dev server (Ctrl+C rồi npm run dev)
# 3. Hard refresh browser (Ctrl+Shift+R)
```

### CORS Error
- Deploy Apps Script: Who has access = **Anyone**
- Redeploy nếu thay đổi settings

### Đơn hàng không lưu
- Check Console tab trong browser (F12)
- Xem Apps Script > Executions để debug
- Test Web App URL trực tiếp trên browser

## 📝 License

Private project - Việt Long Company

## 🌟 Credits

- **UI Design**: Modern premium e-commerce design
- **Backend**: Google Apps Script
- **Frontend**: React + TypeScript + Vite
- **AI**: Google Gemini API

---

**💡 Pro Tips:**
- Share Google Sheet với team để cùng quản lý
- Tạo Google Data Studio dashboard từ Sheets
- Setup Apps Script triggers để auto-backup
- Dùng Google Forms nhập sản phẩm nhanh hơn
