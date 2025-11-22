# 🔧 Sửa lỗi ánh xạ cột trong module Hợp đồng

**Ngày:** 20/11/2025

## ✅ Vấn đề đã sửa:

### 1. **Thiếu thông tin HLV (ma_hlv, ten_hlv)**
- **Vấn đề:** Khi submit contract, không gửi thông tin HLV (huấn luyện viên) của hội viên
- **Nguyên nhân:** Form không thu thập ma_hlv và ten_hlv từ member data
- **Giải pháp:** 
  - Tự động lấy `ptId` và `ptName` từ member data khi tạo hợp đồng Hội viên
  - Map vào `ma_hlv` và `ten_hlv` trong contractData

### 2. **Thiếu trường ưu đãi (uu_dai)**
- **Vấn đề:** Trường `uu_dai` không được lấy từ bảng giá
- **Giải pháp:** Thêm `uu_dai` vào function `getPriceList()` trong ContractController.js

### 3. **Format ngày sinh không đúng**
- **Vấn đề:** Date input cần format `yyyy-mm-dd` nhưng data từ Sheet là `dd/mm/yyyy`
- **Giải pháp:** 
  - Thêm logic convert date format trong `handleCustomerSelectionChange()`
  - Thêm logic convert date format trong `handlePTSelectionChange()`
  - Convert từ `dd/mm/yyyy` → `yyyy-mm-dd` khi populate form

### 4. **Thứ tự cột trong setValue không khớp với Sheet**
- **Vấn đề:** Thứ tự các lệnh `setValue()` không theo đúng thứ tự cột trong Sheet
- **Giải pháp:** Sắp xếp lại các lệnh `setValue()` theo đúng thứ tự:
  ```
  Id → ma_khach_hang → ten_khach_hang → ma_hlv → ten_hlv → 
  ma_bang_gia → ten_bang_gia → noi_dung → thoi_gian → uu_dai → 
  don_gia → don_vi_tinh → so_luong → vat → don_gia_vat → 
  chiet_khau → tong_thanh_toan → thanh_vien → 
  thoi_gian_bat_dau → thoi_gian_ket_thuc → tinh_trang → 
  thoi_gian_tao → ngay_tao → thang → nam → 
  so_dien_thoai → email → cccd → dia_chi → ngay_sinh → gioi_tinh
  ```

## 📋 Cấu trúc cột trong Sheet `hop_dong`:

| # | Tên cột | Nguồn dữ liệu |
|---|---------|---------------|
| 0 | Id | Auto-generate (HĐHV/HĐPT + 4 số) |
| 1 | ma_khach_hang | From member/PT selection |
| 2 | ten_khach_hang | From member/PT selection |
| 3 | ma_hlv | From member.ptId |
| 4 | ten_hlv | From member.ptName |
| 5 | ma_bang_gia | From price list |
| 6 | ten_bang_gia | From price list |
| 7 | noi_dung | From price list |
| 8 | thoi_gian | From price list (thoi_han) |
| 9 | uu_dai | From price list |
| 10 | don_gia | From price list |
| 11 | don_vi_tinh | From price list |
| 12 | so_luong | From form input |
| 13 | vat | From price list |
| 14 | don_gia_vat | From price list |
| 15 | chiet_khau | From price list |
| 16 | tong_thanh_toan | Calculated value |
| 17 | thanh_vien | From dynamic member inputs |
| 18 | thoi_gian_bat_dau | From form input |
| 19 | thoi_gian_ket_thuc | From form input |
| 20 | tinh_trang | From form input |
| 21 | thoi_gian_tao | Auto (current datetime) |
| 22 | ngay_tao | Auto (current date) |
| 23 | thang | Auto (current month) |
| 24 | nam | Auto (current year) |
| 25 | so_dien_thoai | From member/PT info |
| 26 | email | From member/PT info |
| 27 | cccd | From member/PT info |
| 28 | dia_chi | From member/PT info |
| 29 | ngay_sinh | From member/PT info |
| 30 | gioi_tinh | From member/PT info |

## 🔍 Truy vấn dữ liệu từ bảng khác:

### Từ bảng `khach_hang`:
- ✅ `so_dien_thoai` (phoneNumber)
- ✅ `email`
- ✅ `cccd`
- ✅ `dia_chi` (address)
- ✅ `ngay_sinh` (dateOfBirth) - Có convert format
- ✅ `gioi_tinh` (gender)
- ✅ `ma_hlv` (ptId)
- ✅ `ten_hlv` (ptName)

### Từ bảng `PT`:
- ✅ `so_dien_thoai`
- ✅ `email`
- ✅ `cccd`
- ✅ `dia_chi`
- ✅ `ngay_sinh` - Có convert format
- ✅ `gioi_tinh`

## 🛠️ Debug Tools:

Thêm function `debugContractColumns()` để kiểm tra column mapping:
```javascript
// Chạy trong Apps Script Editor:
debugContractColumns();
// Xem kết quả trong View → Logs
```

## 🧪 Testing:

1. **Refresh trang** để load code mới
2. **Tạo hợp đồng Hội viên:**
   - Chọn member có HLV
   - Kiểm tra ma_hlv và ten_hlv được fill
   - Submit và kiểm tra dữ liệu trong Sheet
3. **Tạo hợp đồng PT:**
   - Chọn PT
   - Kiểm tra thông tin PT được fill đúng
   - Submit và kiểm tra dữ liệu trong Sheet
4. **Kiểm tra cột trong Sheet:**
   - Tất cả giá trị phải đúng cột
   - Không có giá trị nào bị lệch

## 📝 Files đã thay đổi:

1. **JavaScript.html:**
   - Thêm logic lấy ma_hlv, ten_hlv từ member data
   - Thêm conversion date format (dd/mm/yyyy → yyyy-mm-dd)
   - Thêm trường uu_dai vào contractData

2. **ContractController.js:**
   - Sắp xếp lại thứ tự setValue() theo đúng cột
   - Thêm logging để debug
   - Thêm function debugContractColumns()
   - Thêm uu_dai vào getPriceList()

## ⚠️ Lưu ý:

- Đảm bảo Sheet `bang_gia` có cột `uu_dai`
- Đảm bảo Sheet `hop_dong` có đủ 31 cột theo đúng thứ tự
- Date format: Sheet lưu theo `dd/mm/yyyy` nhưng input cần `yyyy-mm-dd`
- headerMap sử dụng 0-based index
