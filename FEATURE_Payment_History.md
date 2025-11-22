# Tính năng mới: Xem Lịch sử Thanh toán trong Module Quản lý Hợp đồng

## Ngày tạo: 22/11/2025

## Tổng quan
Đã bổ sung tính năng xem lịch sử thanh toán cho module "Quản lý hợp đồng", cho phép người dùng xem chi tiết các lần thanh toán của từng hợp đồng.

## Các thay đổi được thực hiện

### 1. Backend (Server-side) - ReceiptController.js

#### Thêm function mới: `getReceiptsByContractId(contractId)`
- **Mục đích**: Lấy danh sách tất cả phiếu thu của một hợp đồng cụ thể
- **Input**: `contractId` (string) - Mã hợp đồng
- **Output**: Array các object phiếu thu với đầy đủ thông tin:
  - `id`: Mã phiếu thu
  - `ma_hop_dong`: Mã hợp đồng
  - `ma_khach_hang`: Mã khách hàng
  - `ten_khach_hang`: Tên khách hàng
  - `so_dien_thoai`: Số điện thoại
  - `email`: Email
  - `cccd`: CCCD
  - `tong_thu`: Số tiền thu
  - `lan_thu`: Lần thu thứ mấy
  - `thoi_gian_tao`: Thời gian tạo (formatted)
  - `ngay_tao`: Ngày tạo
  - `nguoi_tao`: Người tạo phiếu thu
  - `tinh_trang`: Tình trạng (Đã thu/Chưa thu)
  - `thang`: Tháng
  - `nam`: Năm

- **Logic**: 
  - Lọc các phiếu thu theo `ma_hop_dong`
  - Loại bỏ các phiếu thu đã xóa (`IsDeleted = 'YES'`)
  - Sắp xếp theo lần thu (mới nhất trước)

#### Cập nhật function `getReceipts()`
- Thêm trường `thang` và `nam` vào output để hiển thị đầy đủ thông tin

### 2. Frontend - Modal (Modal_PaymentHistory.html)

#### Tạo modal mới: `paymentHistoryModal`
**Cấu trúc giao diện:**

1. **Header**: 
   - Tiêu đề "Lịch sử thanh toán"
   - Nút đóng (X)

2. **Thông tin hợp đồng** (phần trên):
   - Mã hợp đồng
   - Tên khách hàng
   - Tên gói tập
   - Tổng giá trị hợp đồng (màu xanh)
   - Đã thanh toán (màu xanh lá)
   - Còn lại (màu đỏ)

3. **Bảng lịch sử thanh toán**:
   - Các cột:
     - Lần thu
     - Mã phiếu thu
     - Số tiền
     - Thời gian
     - Tháng/Năm
     - Người tạo
     - Tình trạng
   - Định dạng:
     - Số tiền: Format VND currency
     - Tình trạng: Badge với màu sắc (xanh lá: Đã thu, đỏ: Chưa thu)

4. **Thống kê tổng kết** (phần dưới):
   - Tổng số lần thu
   - Tổng đã thu (format tiền VND)
   - Trạng thái thanh toán với 3 mức:
     - ✓ Đã thanh toán đủ (xanh lá)
     - ⚠ Đang thanh toán (vàng)
     - ✗ Chưa thanh toán (đỏ)

5. **Footer**:
   - Nút "Đóng"

### 3. Frontend - JavaScript (JavaScript.html)

#### Thêm 3 functions mới:

##### `openPaymentHistory(contract)`
- **Mục đích**: Mở modal và load dữ liệu lịch sử thanh toán
- **Input**: Object `contract` chứa thông tin hợp đồng
- **Logic**:
  1. Hiển thị loader
  2. Fill thông tin hợp đồng vào modal
  3. Gọi `google.script.run.getReceiptsByContractId()` để lấy dữ liệu
  4. Success: Hiển thị modal với dữ liệu
  5. Failure: Hiển thị toast lỗi

##### `displayPaymentHistory(receipts, contract)`
- **Mục đích**: Hiển thị danh sách phiếu thu trong bảng
- **Input**: 
  - `receipts`: Array các phiếu thu
  - `contract`: Thông tin hợp đồng
- **Logic**:
  1. Nếu không có phiếu thu: Hiển thị "Chưa có lịch sử thanh toán"
  2. Có phiếu thu:
     - Render từng dòng với format đẹp
     - Tính tổng số tiền đã thu
     - Cập nhật thống kê:
       - Tổng số lần thu
       - Tổng đã thu
       - Trạng thái thanh toán (logic: nếu còn lại <= 0 thì "Đã thanh toán đủ", nếu > 0 và đã thu > 0 thì "Đang thanh toán", ngược lại "Chưa thanh toán")

##### `closePaymentHistoryModal()`
- **Mục đích**: Đóng modal
- **Logic**: Set display = 'none'

### 4. Frontend - View Contracts (JavaScript.html - displayContracts)

#### Thêm button "Lịch sử thanh toán"
- **Icon**: 📋
- **Màu nền**: #17a2b8 (màu cyan/info)
- **Vị trí**: Sau button "Tạo phiếu thu"
- **Tooltip**: "Lịch sử thanh toán"
- **Action**: Gọi `openPaymentHistory(contract)`

### 5. Integration - index.html

#### Thêm include modal mới
```html
<?!= include('Modal_PaymentHistory'); ?>
```

## Cấu trúc dữ liệu

### Bảng phieu_thu (Receipt sheet)
```
Các cột:
- Id: Mã phiếu thu (primary key)
- ma_hop_dong: Mã hợp đồng (foreign key)
- ma_khach_hang: Mã khách hàng
- ten_khach_hang: Tên khách hàng
- so_dien_thoai: Số điện thoại
- email: Email
- cccd: CCCD
- tong_thu: Số tiền thu (number)
- lan_thu: Lần thu thứ mấy (number)
- thoi_gian_tao: Timestamp tạo phiếu
- ngay_tao: Ngày tạo (string format)
- nguoi_tao: Email người tạo
- thang: Tháng (number)
- nam: Năm (number)
- tinh_trang: Tình trạng thanh toán
- IsDeleted: YES/empty (soft delete flag)
```

## Flow hoạt động

1. **User click button "Lịch sử thanh toán" trên một hợp đồng**
   ↓
2. **Frontend gọi `openPaymentHistory(contract)`**
   - Hiển thị thông tin hợp đồng
   - Show loader
   ↓
3. **Call server-side: `getReceiptsByContractId(contract.id)`**
   - Lấy dữ liệu từ sheet phieu_thu
   - Filter theo ma_hop_dong
   - Loại bỏ deleted records
   - Sort theo lan_thu
   ↓
4. **Success handler: `displayPaymentHistory(receipts, contract)`**
   - Render bảng lịch sử
   - Tính tổng số tiền đã thu
   - Cập nhật statistics
   - Hiển thị modal
   ↓
5. **User xem và đóng modal**

## UI/UX Features

### Responsive design
- Modal rộng 900px (max-width)
- Grid layout 2 cột cho thông tin hợp đồng
- Grid layout 3 cột cho thống kê

### Color coding
- **Xanh dương (#007bff)**: Thông tin tổng giá trị
- **Xanh lá (#28a745)**: Số tiền đã thanh toán, trạng thái "Đã thu"
- **Đỏ (#dc3545)**: Số tiền còn lại, trạng thái "Chưa thu"
- **Vàng (#ffc107)**: Trạng thái "Đang thanh toán"
- **Cyan (#17a2b8)**: Button lịch sử thanh toán

### Number formatting
- Sử dụng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`
- Format: 1.000.000₫

### Date formatting
- Sử dụng `toLocaleString('vi-VN')` cho timestamp
- Format: DD/MM/YYYY HH:mm:ss

## Testing checklist

- [ ] Click button "Lịch sử thanh toán" hiển thị modal đúng
- [ ] Thông tin hợp đồng hiển thị chính xác
- [ ] Danh sách phiếu thu load đúng và đầy đủ
- [ ] Số tiền format đúng định dạng VND
- [ ] Thống kê tính toán chính xác
- [ ] Trạng thái thanh toán hiển thị đúng logic
- [ ] Modal đóng khi click nút X hoặc click ngoài modal
- [ ] Hiển thị loader khi đang load dữ liệu
- [ ] Hiển thị message khi không có lịch sử thanh toán
- [ ] Xử lý lỗi khi không load được dữ liệu

## Files đã chỉnh sửa

1. **ReceiptController.js** - Thêm function `getReceiptsByContractId()`, cập nhật `getReceipts()`
2. **Modal_PaymentHistory.html** - File mới, tạo giao diện modal
3. **JavaScript.html** - Thêm 3 functions xử lý modal
4. **JavaScript.html - displayContracts()** - Thêm button lịch sử thanh toán
5. **index.html** - Include modal mới

## Deployment

Để deploy tính năng này:
```bash
clasp push
```

Hoặc nếu cần pull trước:
```bash
clasp pull
clasp push
```

## Notes

- Tính năng này không ảnh hưởng đến dữ liệu hiện có
- Chỉ đọc dữ liệu, không có thao tác ghi/sửa/xóa
- Compatible với tất cả browsers hiện đại
- Mobile responsive
