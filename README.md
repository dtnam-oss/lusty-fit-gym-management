# Lusty Fit - Gym Management System

Hệ thống quản lý phòng gym được xây dựng trên Google Apps Script.

## Tính năng chính

- 🏃 **Quản lý Khách hàng**: Quản lý thông tin hội viên, tích điểm, xếp hạng
- 📝 **Quản lý Hợp đồng**: Tạo và quản lý hợp đồng Hội viên và PT
- 📄 **Quản lý Mẫu hợp đồng**: Tùy chỉnh và quản lý template HTML cho hợp đồng ⭐ NEW
- 🏋️ **Quản lý PT**: Quản lý huấn luyện viên, tích điểm doanh thu
- 💰 **Quản lý Phiếu thu**: Theo dõi thanh toán và công nợ
- 💳 **Lịch sử thanh toán**: Xem chi tiết lịch sử thanh toán từng hợp đồng
- 💎 **Chính sách**: Cấu hình chính sách tích điểm cho Hội viên và PT
- 🎁 **Quà tặng & Ưu đãi**: Quản lý chương trình khuyến mãi
- 💵 **Bảng giá**: Quản lý gói tập và giá dịch vụ
- ⚙️ **Cấu hình**: Thiết lập tỷ lệ quy đổi điểm

## Công nghệ

- **Backend**: Google Apps Script
- **Frontend**: HTML, CSS, JavaScript
- **Database**: Google Sheets
- **Deployment**: Clasp CLI

## Cấu trúc dự án

```
lusty_fit/
├── Backend Controllers/
│   ├── ContractController.js           # Quản lý hợp đồng
│   ├── ContractTemplateController.js   # Quản lý mẫu hợp đồng ⭐ NEW
│   ├── MemberController.js             # Quản lý khách hàng
│   ├── PTController.js                 # Quản lý PT
│   ├── MemberPointsController.js       # Tính điểm tích lũy
│   ├── ReceiptController.js            # Quản lý phiếu thu
│   ├── PolicyMemberController.js       # Chính sách Hội viên
│   ├── PolicyPTController.js           # Chính sách PT
│   ├── ProgramController.js            # Chương trình khuyến mãi
│   ├── GiftController.js               # Quà tặng
│   ├── PriceListController.js          # Bảng giá
│   ├── SettingsController.js           # Cấu hình
│   └── AppDataController.js            # Load dữ liệu tối ưu
├── Frontend Views/
│   ├── View_Contracts.html             # Giao diện Hợp đồng
│   ├── View_ContractTemplate.html      # Giao diện Mẫu hợp đồng ⭐ NEW
│   ├── View_Members.html               # Giao diện Khách hàng
│   ├── View_PT.html                    # Giao diện PT
│   ├── View_Receipt.html               # Giao diện Phiếu thu
│   └── ...
├── Frontend Modals/
│   ├── Modal_Contract.html             # Form Hợp đồng
│   ├── Modal_ContractTemplate.html     # Form Mẫu hợp đồng ⭐ NEW
│   ├── Modal_Member.html               # Form Khách hàng
│   ├── Modal_PaymentHistory.html       # Lịch sử thanh toán
│   └── ...
├── Print Templates/
│   ├── Contract_Print_Template.html    # Template in hợp đồng Hội viên
│   └── Contract_Print_PT_Template.html # Template in hợp đồng PT
├── Documentation/
│   ├── FEATURE_ContractTemplate_Management.md  ⭐ NEW
│   ├── FEATURE_Payment_History.md
│   ├── SCHEMA_mau_hop_dong.md          ⭐ NEW
│   ├── CHANGELOG_*.md
│   └── BUGFIX_*.md
├── Core Files/
│   ├── index.html                      # Entry point HTML
│   ├── Stylesheet.html                 # CSS chung
│   ├── JavaScript.html                 # JavaScript chung (3200+ lines)
│   ├── Code.js                         # Apps Script entry point
│   ├── Config.js                       # Configuration
│   ├── SheetUtils.js                   # Utility functions
│   └── Triggers.js                     # Auto-update triggers
└── Configuration/
    ├── appsscript.json                 # Apps Script manifest
    └── .clasp.json                     # Clasp configuration

```

## Cài đặt

### Yêu cầu
- Node.js và npm
- Clasp CLI: `npm install -g @google/clasp`
- Tài khoản Google

### Triển khai

1. **Clone repository**
```bash
git clone <repository-url>
cd lusty_fit
```

2. **Login Clasp**
```bash
clasp login
```

3. **Tạo project mới hoặc clone từ existing**
```bash
# Tạo mới
clasp create --title "Lusty Fit" --type webapp

# Hoặc clone từ existing
clasp clone <script-id>
```

4. **Push code lên Apps Script**
```bash
clasp push
```

5. **Deploy as Web App**
```bash
clasp deploy
```

## Sử dụng

1. Mở Google Apps Script Editor
2. Chạy function `doGet()` để khởi động web app
3. Deploy as Web App và cấp quyền truy cập
4. Truy cập URL được cung cấp

## Tính năng nổi bật

### 📄 Quản lý Mẫu hợp đồng (NEW - v1.1)
- Tùy chỉnh HTML template cho hợp đồng Member và PT
- Preview template với sample data
- Kích hoạt/vô hiệu hóa mẫu
- Template variables support
- HTML code editor với syntax guide
- Unique active template rule (chỉ 1 mẫu active/loại)
- Xem chi tiết: [FEATURE_ContractTemplate_Management.md](FEATURE_ContractTemplate_Management.md)

### 💳 Lịch sử thanh toán
- Xem chi tiết lịch sử thanh toán từng hợp đồng
- Theo dõi từng lần thu
- Trạng thái thanh toán real-time
- Thống kê tổng hợp

### 💎 Tích điểm tự động
- Tự động tính điểm dựa trên tổng chi tiêu
- Xếp hạng thành viên: Đồng, Bạc, Vàng, Kim cương
- Cập nhật theo thời gian thực
- Áp dụng cho cả Member và PT

### 📝 Quản lý hợp đồng
- Hỗ trợ 2 loại: Hội viên và PT
- Filter theo loại hợp đồng
- In hợp đồng PDF với template tùy chỉnh
- Tạo phiếu thu tự động
- Tracking thanh toán

### ⚡ Tối ưu hiệu năng
- Lazy loading cho dữ liệu phụ
- Cache header map
- Batch processing
- Rate limiting protection
- Two-stage data loading

## API chính

### Backend Functions

**Contract Template Management**
- `getContractTemplates()` - Lấy danh sách mẫu hợp đồng
- `getActiveTemplateByType(loaiMau)` - Lấy mẫu đang active
- `addContractTemplate(templateData)` - Thêm mẫu mới
- `updateContractTemplate(templateData)` - Cập nhật mẫu
- `deleteContractTemplate(rowNumber)` - Xóa mẫu (soft delete)
- `migrateExistingTemplatesToDB()` - Migration function (run once)

**Member & Contract Management**
- `getMembers()` - Lấy danh sách khách hàng
- `getContracts()` - Lấy danh sách hợp đồng
- `getPTs()` - Lấy danh sách PT
- `getReceipts()` - Lấy danh sách phiếu thu
- `getReceiptsByContractId(contractId)` - Lấy lịch sử thanh toán

**Points Calculation**
- `updateMemberPoints(customerId)` - Cập nhật điểm khách hàng
- `updatePTPoints(ptId)` - Cập nhật điểm PT
- `updateAllMemberPoints()` - Đồng bộ tất cả điểm Member
- `updateAllPTPoints()` - Đồng bộ tất cả điểm PT

## Changelog

Xem file `CHANGELOG_*.md` để biết chi tiết các thay đổi.

## License

Private - All rights reserved

## Contact

Lusty Fit Gym Management System
