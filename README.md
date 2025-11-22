# Lusty Fit - Gym Management System

Hệ thống quản lý phòng gym được xây dựng trên Google Apps Script.

## Tính năng chính

- 🏃 **Quản lý Khách hàng**: Quản lý thông tin hội viên, tích điểm, xếp hạng
- 📝 **Quản lý Hợp đồng**: Tạo và quản lý hợp đồng Hội viên và PT
- 🏋️ **Quản lý PT**: Quản lý huấn luyện viên, tích điểm doanh thu
- 💰 **Quản lý Phiếu thu**: Theo dõi thanh toán và công nợ
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
├── Controllers/
│   ├── ContractController.js       # Quản lý hợp đồng
│   ├── MemberController.js         # Quản lý khách hàng
│   ├── PTController.js             # Quản lý PT
│   ├── MemberPointsController.js   # Tính điểm tích lũy
│   ├── ReceiptController.js        # Quản lý phiếu thu
│   ├── PolicyMemberController.js   # Chính sách Hội viên
│   ├── PolicyPTController.js       # Chính sách PT
│   ├── ProgramController.js        # Chương trình khuyến mãi
│   ├── GiftController.js           # Quà tặng
│   ├── PriceListController.js      # Bảng giá
│   ├── SettingsController.js       # Cấu hình
│   └── AppDataController.js        # Load dữ liệu tối ưu
├── Views/
│   ├── View_Contracts.html         # Giao diện Hợp đồng
│   ├── View_Members.html           # Giao diện Khách hàng
│   ├── View_PT.html                # Giao diện PT
│   └── ...
├── Modals/
│   ├── Modal_Contract.html         # Form Hợp đồng
│   ├── Modal_Member.html           # Form Khách hàng
│   └── ...
├── Templates/
│   ├── Contract_Print_Template.html
│   └── Contract_Print_PT_Template.html
├── Stylesheet.html                 # CSS chung
├── JavaScript.html                 # JavaScript chung
├── Code.js                         # Entry point
├── Config.js                       # Cấu hình
├── SheetUtils.js                   # Utility functions
└── Triggers.js                     # Auto-update triggers

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

### Tích điểm tự động
- Tự động tính điểm dựa trên tổng chi tiêu
- Xếp hạng thành viên: Đồng, Bạc, Vàng, Kim cương
- Cập nhật theo thời gian thực

### Quản lý hợp đồng
- Hỗ trợ 2 loại: Hội viên và PT
- Filter theo loại hợp đồng
- In hợp đồng PDF
- Tạo phiếu thu tự động

### Tối ưu hiệu năng
- Lazy loading cho dữ liệu phụ
- Cache header map
- Batch processing
- Rate limiting protection

## API chính

### Backend Functions
- `getMembers()` - Lấy danh sách khách hàng
- `getContracts()` - Lấy danh sách hợp đồng
- `getPTs()` - Lấy danh sách PT
- `updateMemberPoints(customerId)` - Cập nhật điểm khách hàng
- `updatePTPoints(ptId)` - Cập nhật điểm PT

## Changelog

Xem file `CHANGELOG_*.md` để biết chi tiết các thay đổi.

## License

Private - All rights reserved

## Contact

Lusty Fit Gym Management System
