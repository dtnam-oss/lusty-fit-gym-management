# Feature: Contract Template Management Module

## Tổng quan

Module quản lý mẫu hợp đồng cho phép user xem, thêm, sửa, xóa và kích hoạt các mẫu hợp đồng (Member và PT) thông qua giao diện web.

## Ngày phát triển
11/01/2026

## Các file đã tạo mới

### Backend (Google Apps Script)
1. **ContractTemplateController.js** (283 dòng)
   - Quản lý CRUD operations cho mẫu hợp đồng
   - Functions:
     - `getContractTemplates()` - Lấy danh sách mẫu
     - `getActiveTemplateByType(loaiMau)` - Lấy mẫu đang sử dụng
     - `getContractTemplateByRow(rowNumber)` - Lấy chi tiết 1 mẫu
     - `addContractTemplate(templateData)` - Thêm mẫu mới
     - `updateContractTemplate(templateData)` - Cập nhật mẫu
     - `deleteContractTemplate(rowNumber)` - Xóa mẫu (soft delete)
     - `deactivateOtherTemplates()` - Vô hiệu hóa mẫu cũ khi kích hoạt mẫu mới
     - `migrateExistingTemplatesToDB()` - Migration function (chạy 1 lần)

### Frontend (HTML)
2. **View_ContractTemplate.html** (161 dòng)
   - Giao diện hiển thị danh sách mẫu hợp đồng
   - Features:
     - Bảng danh sách với search
     - Filter theo loại (Tất cả / Hội viên / PT)
     - Actions: Xem trước, Sửa, Kích hoạt, Xóa

3. **Modal_ContractTemplate.html** (305 dòng)
   - Form thêm/sửa mẫu hợp đồng
   - Features:
     - HTML code editor với syntax highlighting
     - Template variables guide
     - Preview functionality
     - Status management

### Frontend JavaScript
4. **JavaScript.html** (thêm ~430 dòng code)
   - Functions quản lý mẫu hợp đồng:
     - `displayContractTemplates()` - Load và hiển thị danh sách
     - `renderContractTemplateTable()` - Render bảng
     - `filterContractTemplateByType()` - Lọc theo loại
     - `filterContractTemplateTable()` - Tìm kiếm
     - `openAddContractTemplateModal()` - Mở modal thêm
     - `openEditContractTemplateModal()` - Mở modal sửa
     - `saveContractTemplate()` - Lưu mẫu
     - `deleteContractTemplate()` - Xóa mẫu
     - `activateContractTemplate()` - Kích hoạt mẫu
     - `previewContractTemplate()` - Xem trước với sample data
     - `previewHTMLContent()` - Xem trước từ editor
     - `toggleHTMLEditor()` - Chuyển đổi chế độ editor

### Documentation
5. **SCHEMA_mau_hop_dong.md**
   - Schema chi tiết cho sheet database
   - Business rules và hướng dẫn setup

6. **FEATURE_ContractTemplate_Management.md** (file này)
   - Tài liệu tổng quan về feature

## Các file đã chỉnh sửa

1. **index.html**
   - Thêm menu item "Mẫu hợp đồng" vào sidebar (dòng 44-47)
   - Include View_ContractTemplate.html (dòng 100)
   - Include Modal_ContractTemplate.html (dòng 113)

2. **JavaScript.html**
   - Thêm case 'contract-template' vào `switchView()` function (dòng 284)
   - Thêm toàn bộ contract template management functions (dòng 2858-3290)

## Cấu trúc Database

### Sheet: mau_hop_dong

| Cột | Type | Mô tả |
|-----|------|-------|
| Id | String | Template ID (TPL-timestamp) |
| Tên mẫu | String | Tên mẫu hợp đồng |
| Loại mẫu | String | "Hội viên" hoặc "PT" |
| Mô tả | String | Mô tả chi tiết |
| Nội dung HTML | Text | Full HTML template |
| Trạng thái | String | "Đang sử dụng" / "Không sử dụng" |
| Ngày tạo | String | dd/MM/yyyy |
| Thời gian tạo | String | dd/MM/yyyy HH:mm:ss |
| Người tạo | String | Email |
| Ngày cập nhật | String | dd/MM/yyyy |
| Thời gian cập nhật | String | dd/MM/yyyy HH:mm:ss |
| Người cập nhật | String | Email |
| IsDeleted | String | YES/NO |

## Template Variables Support

Các biến có thể sử dụng trong HTML template:

### Customer Data
- `<?= customer['Họ và Tên'] || '' ?>`
- `<?= customer['CCCD'] || '' ?>`
- `<?= customer['Địa chỉ'] || '' ?>`
- `<?= customer['Email'] || '' ?>`
- `<?= customer['Số điện thoại'] || '' ?>`
- `<?= customer['Giới tính'] || '' ?>`
- `<?= customer['Ngày sinh'] || '' ?>`

### Contract Data
- `<?= contract.id || '' ?>`
- `<?= contract.customerId || '' ?>`
- `<?= contract.packageName || '' ?>`
- `<?= contract.totalAmount || '' ?>`
- `<?= contract.startDate || '' ?>`
- `<?= contract.endDate || '' ?>`

### Other
- `<?= generatedDate || '' ?>`

## Business Logic

### Unique Active Template Rule
- Mỗi loại (Hội viên / PT) chỉ có 1 mẫu với trạng thái "Đang sử dụng"
- Khi kích hoạt mẫu mới, mẫu cũ cùng loại sẽ tự động bị vô hiệu hóa
- Implemented trong function `deactivateOtherTemplates()`

### Soft Delete
- Không xóa vật lý record
- Chỉ đánh dấu `IsDeleted = 'YES'`
- Filtered out khi query

## User Workflows

### 1. Xem danh sách mẫu hợp đồng
```
User clicks "Mẫu hợp đồng" menu
  ↓
switchView('contract-template')
  ↓
displayContractTemplates()
  ↓
Load data from sheet 'mau_hop_dong'
  ↓
Render table với filter & search
```

### 2. Thêm mẫu mới
```
Click "Thêm mẫu hợp đồng"
  ↓
openAddContractTemplateModal()
  ↓
Fill form (name, type, description, HTML, status)
  ↓
Preview HTML (optional)
  ↓
Click "Lưu mẫu"
  ↓
saveContractTemplate() → addContractTemplate()
  ↓
Auto-deactivate old template if status = "Đang sử dụng"
  ↓
Refresh table
```

### 3. Sửa mẫu
```
Click "Sửa" button
  ↓
openEditContractTemplateModal(rowNumber)
  ↓
Load existing data
  ↓
Edit form
  ↓
Preview changes (optional)
  ↓
Click "Lưu mẫu"
  ↓
updateContractTemplate()
  ↓
Refresh table
```

### 4. Xem trước mẫu
```
Click "Xem trước" button
  ↓
previewContractTemplate(rowNumber)
  ↓
Load template HTML
  ↓
Replace variables with sample data
  ↓
Display in fullscreen modal
```

### 5. Kích hoạt mẫu
```
Click "Kích hoạt" button
  ↓
Confirm dialog
  ↓
activateContractTemplate(rowNumber)
  ↓
Update status to "Đang sử dụng"
  ↓
Deactivate other templates of same type
  ↓
Refresh table
```

## Deployment Guide

### Bước 1: Tạo Sheet Database
1. Mở Google Spreadsheet của hệ thống
2. Tạo sheet mới tên "mau_hop_dong"
3. Thêm header row với các cột theo schema (xem SCHEMA_mau_hop_dong.md)

### Bước 2: Upload Files lên Google Apps Script
1. Mở Apps Script editor (Extensions → Apps Script)
2. Upload các file mới:
   - ContractTemplateController.js (File → New → Script file)
   - View_ContractTemplate.html (File → New → HTML file)
   - Modal_ContractTemplate.html (File → New → HTML file)
3. Cập nhật các file đã sửa:
   - index.html
   - JavaScript.html

### Bước 3: Migration Template Hiện Tại
Run function `migrateExistingTemplatesToDB()` một lần duy nhất để import 2 template hiện tại vào database:

```javascript
// Trong Apps Script editor:
// 1. Chọn function: migrateExistingTemplatesToDB
// 2. Click Run
// 3. Authorize nếu cần
// 4. Check logs để verify thành công
```

Function này sẽ:
- Đọc nội dung từ `Contract_Print_Template.html` → Lưu vào DB với loại "Hội viên", status "Đang sử dụng"
- Đọc nội dung từ `Contract_Print_PT_Template.html` → Lưu vào DB với loại "PT", status "Đang sử dụng"

### Bước 4: Deploy Web App
1. Click "Deploy" → "New deployment"
2. Chọn type: Web app
3. Description: "Added Contract Template Management"
4. Execute as: Me
5. Who has access: Anyone with the link (hoặc theo setting hiện tại)
6. Click "Deploy"
7. Copy Web App URL

### Bước 5: Test
1. Mở Web App URL
2. Click menu "Mẫu hợp đồng"
3. Verify danh sách hiển thị 2 mẫu đã migrate
4. Test các chức năng:
   - Xem trước
   - Thêm mẫu mới
   - Sửa mẫu
   - Kích hoạt/vô hiệu hóa
   - Xóa

## Security & Permissions

### Current Setup
- Access: `ANYONE_ANONYMOUS` (public access)
- Execution: `USER_DEPLOYING`
- No frontend permission checking
- Audit trail: `nguoi_tao`, `nguoi_cap_nhat` fields

### Recommendations
Nếu muốn hạn chế quyền sửa mẫu hợp đồng:
1. Thêm permission check trong backend
2. Tạo role-based access (Admin/Editor/Viewer)
3. Hide/disable buttons dựa trên role

## Known Limitations

1. **Visual Editor**: Chưa implement, chỉ có code editor
2. **Version Control**: Chưa có version history cho template
3. **Validation**: Chưa validate syntax HTML
4. **Variables Auto-complete**: Chưa có auto-complete cho template variables

## Future Enhancements

1. **Rich Text Editor**: Integrate WYSIWYG editor (TinyMCE, CKEditor)
2. **Version History**: Track changes và cho phép rollback
3. **HTML Validation**: Validate HTML syntax trước khi save
4. **Auto-complete**: Template variable auto-complete trong editor
5. **Duplicate Template**: Function để copy mẫu existing
6. **Export/Import**: Export template ra file, import từ file
7. **Preview với Real Data**: Preview với contract data thực tế thay vì sample

## Testing Checklist

- [ ] Sheet 'mau_hop_dong' được tạo với đúng schema
- [ ] Migration function chạy thành công
- [ ] Menu item "Mẫu hợp đồng" hiển thị trong sidebar
- [ ] Click menu → View chuyển đổi đúng
- [ ] Danh sách mẫu load và hiển thị
- [ ] Filter theo loại hoạt động
- [ ] Search function hoạt động
- [ ] Thêm mẫu mới thành công
- [ ] Sửa mẫu existing thành công
- [ ] Xem trước hiển thị đúng template
- [ ] Kích hoạt mẫu → mẫu cũ bị vô hiệu hóa
- [ ] Xóa mẫu (soft delete) thành công
- [ ] Template variables được replace đúng
- [ ] Responsive trên mobile

## Support & Troubleshooting

### Issue: Sheet 'mau_hop_dong' không tồn tại
**Solution**: Tạo sheet với tên chính xác 'mau_hop_dong' (lowercase, không dấu)

### Issue: Migration function lỗi "Template file not found"
**Solution**: Verify rằng `Contract_Print_Template.html` và `Contract_Print_PT_Template.html` tồn tại trong project

### Issue: Preview không hiển thị
**Solution**:
- Check browser console cho JavaScript errors
- Verify template HTML syntax hợp lệ
- Ensure modal không bị che bởi other elements

### Issue: Không thể kích hoạt mẫu
**Solution**:
- Check permissions
- Verify sheet không bị protect
- Check Apps Script logs

## Contact & Credits

**Developed by**: Claude (Anthropic)
**Project**: Lusty Fit Gym Management System
**Module**: Contract Template Management
**Version**: 1.0
**Date**: January 11, 2026
