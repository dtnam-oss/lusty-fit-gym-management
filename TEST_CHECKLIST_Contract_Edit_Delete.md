# ✅ TEST CHECKLIST - TÍNH NĂNG SỬA VÀ XÓA HỢP ĐỒNG

**Ngày tạo:** 21/11/2025  
**Mục đích:** Kiểm tra logic sửa và xóa hợp đồng sau khi fix bugs

---

## 📋 HƯỚNG DẪN TEST

### **Chuẩn bị:**
1. Mở ứng dụng web
2. Đăng nhập với tài khoản có quyền quản lý hợp đồng
3. Vào module **Quản lý Hợp đồng**
4. Chuẩn bị sheet Google để xem dữ liệu thực tế

---

## 🧪 TEST CASE 1: SỬA HỢP ĐỒNG HỘI VIÊN

### **Bước 1: Tạo hợp đồng mới để test**
- [ ] Click "Tạo hợp đồng mới"
- [ ] Chọn loại: **Hội viên**
- [ ] Chọn hội viên bất kỳ
- [ ] Chọn gói tập bất kỳ
- [ ] Điền đầy đủ thông tin: số lượng, ngày bắt đầu, etc.
- [ ] Click "Lưu"
- [ ] **Kết quả mong đợi:** Hợp đồng được tạo thành công

### **Bước 2: Sửa hợp đồng vừa tạo**
- [ ] Click nút "✏️ Sửa" trên hợp đồng vừa tạo
- [ ] **Kiểm tra:** Modal hiển thị đầy đủ thông tin
- [ ] **Kiểm tra:** Loại hợp đồng "Hội viên" được chọn đúng
- [ ] **Kiểm tra:** Dropdown hội viên có giá trị đúng
- [ ] **Kiểm tra:** Gói tập được chọn đúng
- [ ] **Kiểm tra:** Các trường giá, VAT, thời hạn hiển thị đúng

### **Bước 3: Thay đổi thông tin**
Thay đổi các thông tin sau:
- [ ] Đơn giá: Sửa từ `1000000` → `1500000`
- [ ] VAT: Sửa từ `10%` → `8%`
- [ ] Chiết khấu: Thêm/sửa giá trị
- [ ] Số điện thoại: Sửa số mới
- [ ] Email: Sửa email mới
- [ ] CCCD: Sửa số CCCD mới
- [ ] Địa chỉ: Sửa địa chỉ mới
- [ ] Tình trạng: Đổi từ "Đang hiệu lực" → "Hết hạn"
- [ ] Click "Cập nhật"
- [ ] **Kết quả mong đợi:** Thông báo "Cập nhật hợp đồng thành công!"

### **Bước 4: Kiểm tra dữ liệu đã lưu**
- [ ] Mở Google Sheet `hop_dong`
- [ ] Tìm dòng hợp đồng vừa sửa
- [ ] **Kiểm tra:** Cột `don_gia` = `1500000` ✅
- [ ] **Kiểm tra:** Cột `vat` = `8` ✅
- [ ] **Kiểm tra:** Cột `so_dien_thoai` đã đổi ✅
- [ ] **Kiểm tra:** Cột `email` đã đổi ✅
- [ ] **Kiểm tra:** Cột `cccd` đã đổi ✅
- [ ] **Kiểm tra:** Cột `dia_chi` đã đổi ✅
- [ ] **Kiểm tra:** Cột `tinh_trang` = "Hết hạn" ✅
- [ ] **Kiểm tra:** Cột `nguoi_cap_nhat` có email của bạn ✅
- [ ] **Kiểm tra:** Cột `thoi_gian_cap_nhat` có timestamp hiện tại ✅

### **Bước 5: In hợp đồng để kiểm tra**
- [ ] Click nút "🖨️ In" trên hợp đồng vừa sửa
- [ ] **Kiểm tra:** File PDF/HTML hiển thị đúng đơn giá `1500000` ✅
- [ ] **Kiểm tra:** VAT hiển thị đúng `8%` ✅
- [ ] **Kiểm tra:** Thông tin cá nhân (SĐT, email, CCCD) hiển thị đúng ✅

---

## 🧪 TEST CASE 2: SỬA HỢP ĐỒNG PT

### **Bước 1: Tạo hợp đồng PT**
- [ ] Click "Tạo hợp đồng mới"
- [ ] Chọn loại: **PT**
- [ ] Chọn PT bất kỳ
- [ ] Chọn gói tập PT
- [ ] Điền đầy đủ thông tin
- [ ] Click "Lưu"

### **Bước 2: Sửa hợp đồng PT**
- [ ] Click "✏️ Sửa"
- [ ] **Kiểm tra:** Loại hợp đồng "PT" được chọn đúng
- [ ] **Kiểm tra:** Dropdown PT có giá trị đúng
- [ ] Sửa đơn giá từ `2000000` → `2500000`
- [ ] Sửa thời hạn
- [ ] Click "Cập nhật"

### **Bước 3: Kiểm tra dữ liệu**
- [ ] Mở Google Sheet `hop_dong`
- [ ] **Kiểm tra:** Cột `gia_tri` = `2500000` ✅ (Vì là hợp đồng PT)
- [ ] **Kiểm tra:** Cột `don_gia` = trống ✅
- [ ] **Kiểm tra:** Cột `loai_hop_dong` = "PT" ✅
- [ ] **Kiểm tra:** Cột `nguoi_cap_nhat` có email ✅
- [ ] **Kiểm tra:** Cột `thoi_gian_cap_nhat` có timestamp ✅

---

## 🧪 TEST CASE 3: XÓA HỢP ĐỒNG

### **Bước 1: Xóa hợp đồng bình thường**
- [ ] Chọn một hợp đồng bất kỳ
- [ ] Click nút "🗑️ Xóa"
- [ ] **Kiểm tra:** Dialog confirm xuất hiện "Bạn có chắc chắn muốn xóa hợp đồng này?"
- [ ] Click "OK"
- [ ] **Kết quả mong đợi:** Thông báo "Xóa hợp đồng thành công!"
- [ ] **Kiểm tra:** Hợp đồng biến mất khỏi danh sách ✅

### **Bước 2: Kiểm tra soft delete trong sheet**
- [ ] Mở Google Sheet `hop_dong`
- [ ] Tìm dòng hợp đồng vừa xóa
- [ ] **Kiểm tra:** Cột `IsDeleted` = "YES" ✅
- [ ] **Kiểm tra:** Cột `nguoi_xoa` có email của bạn ✅
- [ ] **Kiểm tra:** Cột `thoi_gian_xoa` có timestamp ✅
- [ ] **Kiểm tra:** Dữ liệu khác vẫn còn nguyên (không bị xóa thật) ✅

---

## 🧪 TEST CASE 4: EDGE CASES (KIỂM TRA XỬ LÝ LỖI)

### **Test 4.1: Thử sửa hợp đồng đã bị xóa**
- [ ] Vào Google Sheet, copy ID của hợp đồng đã xóa (IsDeleted = "YES")
- [ ] Thử gọi function `getContractByRow(rowNumber)` với rowNumber của hợp đồng đã xóa
- [ ] **Kết quả mong đợi:** Không cho phép load, hoặc hiển thị cảnh báo

### **Test 4.2: Thử xóa hợp đồng đã bị xóa rồi**
- [ ] Tìm hợp đồng có `IsDeleted = "YES"`
- [ ] Temporary bỏ filter (nếu có) để thấy hợp đồng đã xóa
- [ ] Thử click xóa lại lần nữa
- [ ] **Kết quả mong đợi:** Báo lỗi "Hợp đồng này đã bị xóa trước đó."

### **Test 4.3: Thử sửa với số lượng > 1**
- [ ] Tạo hợp đồng với số lượng = 3
- [ ] Nhập tên 2 thành viên bổ sung
- [ ] Lưu hợp đồng
- [ ] Sửa lại hợp đồng, đổi số lượng thành 2
- [ ] **Kiểm tra:** Chỉ còn 1 field thành viên bổ sung
- [ ] Lưu lại
- [ ] **Kiểm tra:** Cột `so_luong` = 2 ✅
- [ ] **Kiểm tra:** Cột `thanh_vien` chỉ có 1 thành viên ✅

### **Test 4.4: Sửa hợp đồng đổi loại (Hội viên ↔ PT)**
- [ ] Tạo hợp đồng Hội viên
- [ ] Sửa hợp đồng, đổi sang PT
- [ ] **Kiểm tra:** Dropdown thay đổi từ "Chọn hội viên" → "Chọn PT" ✅
- [ ] **Kiểm tra:** Gói tập cũng thay đổi theo (chỉ hiển thị gói PT) ✅
- [ ] Lưu lại
- [ ] Mở sheet: Kiểm tra `loai_hop_dong` đã đổi ✅

---

## 🧪 TEST CASE 5: BẢO VỆ DỮ LIỆU THANH TOÁN

### **Scenario: Sửa hợp đồng sau khi đã có phiếu thu**

**Bước 1: Setup**
- [ ] Tạo hợp đồng mới, tổng thanh toán = 5,000,000 VND
- [ ] Tạo phiếu thu cho hợp đồng này: Thanh toán 2,000,000 VND
- [ ] **Kiểm tra sheet:** `con_phai_thu` = 3,000,000 ✅
- [ ] **Kiểm tra sheet:** `tinh_trang_thanh_toan` = "Đã thanh toán một phần" ✅

**Bước 2: Sửa hợp đồng (không đổi tổng thanh toán)**
- [ ] Click sửa hợp đồng
- [ ] Chỉ sửa thông tin khác (email, địa chỉ, tình trạng)
- [ ] KHÔNG thay đổi tổng thanh toán
- [ ] Lưu lại

**Bước 3: Kiểm tra dữ liệu thanh toán KHÔNG BỊ MẤT**
- [ ] Mở sheet `hop_dong`
- [ ] **Kiểm tra:** `con_phai_thu` vẫn = 3,000,000 ✅ (KHÔNG bị reset)
- [ ] **Kiểm tra:** `tinh_trang_thanh_toan` vẫn = "Đã thanh toán một phần" ✅ (KHÔNG bị reset)
- [ ] **Kiểm tra:** Email, địa chỉ đã được cập nhật ✅

**Kết luận:** Dữ liệu thanh toán được BẢO VỆ khi sửa hợp đồng ✅

---

## 🧪 TEST CASE 6: KIỂM TRA LOGGING VÀ AUDIT TRAIL

### **Test 6.1: Xem Apps Script Logs**
- [ ] Vào Apps Script Editor
- [ ] Mở "Executions" logs
- [ ] Sửa một hợp đồng
- [ ] **Kiểm tra logs:** Có log "updateContract: Starting for row X" ✅
- [ ] **Kiểm tra logs:** Có log "updateContract: Contract updated successfully" ✅

### **Test 6.2: Xem Audit Trail trong Sheet**
- [ ] Sửa 1 hợp đồng
- [ ] Mở sheet, kiểm tra:
  - [ ] Cột `nguoi_cap_nhat` = email của bạn ✅
  - [ ] Cột `thoi_gian_cap_nhat` = thời điểm hiện tại ✅
- [ ] Xóa 1 hợp đồng
- [ ] Mở sheet, kiểm tra:
  - [ ] Cột `nguoi_xoa` = email của bạn ✅
  - [ ] Cột `thoi_gian_xoa` = thời điểm hiện tại ✅

---

## 📊 KẾT QUẢ TEST

### **Tổng quan:**
- **Tổng số test case:** 6 chính + nhiều sub-tests
- **Số test đã pass:** _____ / _____
- **Số test failed:** _____ / _____
- **Bugs phát hiện thêm:** _____

### **Bảng kết quả chi tiết:**

| Test Case | Status | Ghi chú |
|-----------|--------|---------|
| TC1: Sửa hợp đồng Hội viên | ⬜ Pass / ⬜ Fail |  |
| TC2: Sửa hợp đồng PT | ⬜ Pass / ⬜ Fail |  |
| TC3: Xóa hợp đồng | ⬜ Pass / ⬜ Fail |  |
| TC4: Edge cases | ⬜ Pass / ⬜ Fail |  |
| TC5: Bảo vệ thanh toán | ⬜ Pass / ⬜ Fail |  |
| TC6: Logging & Audit | ⬜ Pass / ⬜ Fail |  |

---

## 🐛 BUG REPORT (NẾU CÓ)

### **Bug #1:**
- **Mô tả:**
- **Bước tái hiện:**
- **Kết quả mong đợi:**
- **Kết quả thực tế:**
- **Mức độ nghiêm trọng:** Critical / High / Medium / Low

### **Bug #2:**
- **Mô tả:**
- **Bước tái hiện:**
- **Kết quả mong đợi:**
- **Kết quả thực tế:**
- **Mức độ nghiêm trọng:** Critical / High / Medium / Low

---

## ✅ SIGN-OFF

**Người test:** _______________________  
**Ngày test:** _______________________  
**Kết quả:** ⬜ APPROVED / ⬜ REJECTED  

**Ghi chú:**
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

**Lưu ý quan trọng:**
- ✅ Phải test trên môi trường production HOẶC staging giống production
- ✅ Nên test với nhiều loại hợp đồng khác nhau
- ✅ Nên test với data thật (không phải data test)
- ✅ Sau khi test xong, PHẢI kiểm tra Google Sheet để chắc chắn data đúng
- ✅ Nếu phát hiện bug, BÁO NGAY cho developer
