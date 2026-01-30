import type { Order } from '../types';

// Excel export service using SheetJS
export const excelService = {
    /**
     * Export orders to Excel file
     */
    exportOrdersToExcel(orders: Order[], filename: string = 'orders.xlsx'): void {
        // Check if XLSX library is loaded
        if (typeof (window as any).XLSX === 'undefined') {
            console.error('SheetJS library not loaded');
            alert('Excel export library chưa được tải. Vui lòng refresh trang.');
            return;
        }

        const XLSX = (window as any).XLSX;

        // Format data for Excel
        const excelData = orders.map(order => ({
            'Mã đơn': order.id,
            'Khách hàng': order.userName,
            'Email': order.userEmail || 'N/A',
            'Số điện thoại': order.phone,
            'Địa chỉ': order.address,
            'Sản phẩm': order.items.map(item => `${item.name} (x${item.quantity})`).join(', '),
            'Tổng tiền': order.total,
            'Trạng thái': order.status,
            'Ngày đặt': new Date(order.createdAt).toLocaleString('vi-VN')
        }));

        // Create workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

        // Set column widths
        const columnWidths = [
            { wch: 15 }, // Mã đơn
            { wch: 25 }, // Khách hàng
            { wch: 30 }, // Email
            { wch: 15 }, // Số điện thoại
            { wch: 40 }, // Địa chỉ
            { wch: 50 }, // Sản phẩm
            { wch: 15 }, // Tổng tiền
            { wch: 15 }, // Trạng thái
            { wch: 20 }  // Ngày đặt
        ];
        worksheet['!cols'] = columnWidths;

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        const finalFilename = `${filename.replace('.xlsx', '')}_${timestamp}.xlsx`;

        // Download file
        XLSX.writeFile(workbook, finalFilename);

        console.log(`✅ Exported ${orders.length} orders to ${finalFilename}`);
    },

    /**
     * Export products to Excel file
     */
    exportProductsToExcel(products: any[], filename: string = 'products.xlsx'): void {
        if (typeof (window as any).XLSX === 'undefined') {
            console.error('SheetJS library not loaded');
            alert('Excel export library chưa được tải. Vui lòng refresh trang.');
            return;
        }

        const XLSX = (window as any).XLSX;

        const excelData = products.map(product => ({
            'Mã SP': product.id,
            'Tên sản phẩm': product.name,
            'Giá': product.price,
            'Mô tả': product.description,
            'Danh mục': product.category,
            'Số lượng': product.stock,
            'Hình ảnh': product.image
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

        const timestamp = new Date().toISOString().slice(0, 10);
        const finalFilename = `${filename.replace('.xlsx', '')}_${timestamp}.xlsx`;

        XLSX.writeFile(workbook, finalFilename);

        console.log(`✅ Exported ${products.length} products to ${finalFilename}`);
    }
};
