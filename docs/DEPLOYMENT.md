# 🚀 Hướng dẫn Deploy Lusty Fit lên GitHub Pages

## 📋 Tổng quan

Dự án Lusty Fit sử dụng kiến trúc tách biệt:
- **Frontend**: GitHub Pages (Landing page + redirect)
- **Backend**: Google Apps Script Web App (Xử lý logic và database)

## 🎯 Các bước thực hiện

### Bước 1: Deploy Google Apps Script Web App

1. **Mở Google Apps Script Editor:**
   ```bash
   clasp open
   ```
   
   Hoặc truy cập trực tiếp: https://script.google.com

2. **Deploy Web App:**
   - Click nút **"Deploy"** (góc trên bên phải)
   - Chọn **"New deployment"**
   - Chọn type: **"Web app"**
   - Điền thông tin:
     - **Description**: "Lusty Fit v1.0"
     - **Execute as**: "Me" (your-email@gmail.com)
     - **Who has access**: Chọn tùy theo nhu cầu:
       - `Only myself` - Chỉ bạn
       - `Anyone` - Mọi người (khuyến nghị cho public app)
   - Click **"Deploy"**

3. **Authorize & Copy URL:**
   - Click "Authorize access" và đăng nhập
   - Chấp nhận các quyền cần thiết
   - **QUAN TRỌNG**: Copy **Web app URL** 
     - Định dạng: `https://script.google.com/macros/s/AKfycby.../exec`
     - Lưu URL này để dùng cho bước tiếp theo

### Bước 2: Cập nhật Landing Page với Web App URL

1. **Mở file `docs/index.html`:**
   ```bash
   code docs/index.html
   ```

2. **Tìm và thay thế dòng này:**
   ```javascript
   const WEB_APP_URL = 'YOUR_DEPLOYED_WEB_APP_URL_HERE';
   ```
   
   Thay bằng URL bạn đã copy ở Bước 1:
   ```javascript
   const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```

3. **Lưu file**

### Bước 3: Commit và Push lên GitHub

```bash
# Add changes
git add docs/

# Commit
git commit -m "Add GitHub Pages landing page with Web App URL"

# Push to GitHub
git push origin main
```

### Bước 4: Enable GitHub Pages

1. Truy cập repository: https://github.com/dtnam-oss/lusty-fit-gym-management

2. Vào **Settings** > **Pages**

3. Cấu hình:
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/docs`
   - Click **Save**

4. Đợi 1-2 phút để GitHub deploy

5. GitHub sẽ tạo URL dạng:
   ```
   https://dtnam-oss.github.io/lusty-fit-gym-management/
   ```

### Bước 5: (Tùy chọn) Cấu hình Custom Domain

Nếu bạn muốn domain riêng như `ghtk.solution.io.vn`:

1. Trong **Settings** > **Pages** > **Custom domain**
2. Nhập domain của bạn: `gym.yourdomain.com`
3. Click **Save**
4. Cấu hình DNS records tại nhà cung cấp domain:
   ```
   Type: CNAME
   Name: gym (hoặc subdomain bạn muốn)
   Value: dtnam-oss.github.io
   ```

## ✅ Kiểm tra kết quả

1. **Truy cập GitHub Pages URL:**
   ```
   https://dtnam-oss.github.io/lusty-fit-gym-management/
   ```

2. **Kiểm tra Landing Page:**
   - Nên thấy trang đẹp với logo Lusty Fit
   - Trạng thái hiển thị "Đã deploy" (màu xanh)

3. **Click "Khởi chạy ứng dụng":**
   - Sẽ redirect đến Google Apps Script Web App
   - Ứng dụng CRM đầy đủ chức năng sẽ mở ra

## 🔧 Troubleshooting

### Lỗi 1: "Ứng dụng chưa được cấu hình"
**Nguyên nhân**: Chưa cập nhật `WEB_APP_URL` trong `docs/index.html`  
**Giải pháp**: Làm lại Bước 2

### Lỗi 2: GitHub Pages không hiển thị
**Nguyên nhân**: Chưa enable GitHub Pages hoặc chọn sai folder  
**Giải pháp**: Kiểm tra lại Bước 4, đảm bảo chọn `/docs` folder

### Lỗi 3: Web App không chạy
**Nguyên nhân**: Chưa authorize hoặc deploy sai  
**Giải pháp**: Làm lại Bước 1, đảm bảo chọn "Anyone" cho public access

### Lỗi 4: "Authorization required"
**Nguyên nhân**: Apps Script cần quyền truy cập Google Sheets  
**Giải pháp**: Click "Review permissions" và accept

## 📊 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│  User Browser                                                │
│  └─> https://dtnam-oss.github.io/lusty-fit-gym-management/ │
│      (GitHub Pages - Landing Page)                          │
└──────────────────┬──────────────────────────────────────────┘
                   │ Click "Khởi chạy"
                   │ Redirect
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Google Apps Script Web App                                  │
│  https://script.google.com/macros/s/AKfycby.../exec        │
│  ├─ index.html (Full UI)                                    │
│  ├─ Controllers (Backend logic)                             │
│  └─ Google Sheets (Database)                                │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Tùy chỉnh Landing Page

File `docs/index.html` có thể tùy chỉnh:
- Logo: Thay đổi URL trong thẻ `<img>`
- Màu sắc: Sửa gradient trong CSS
- Nội dung: Thêm/bớt features
- Animation: Tùy chỉnh CSS animations

## 🔒 Bảo mật

- Google Apps Script Web App được bảo vệ bởi Google OAuth
- Chỉ có tài khoản có quyền mới truy cập được (nếu chọn "Only myself")
- GitHub Pages chỉ là landing page công khai, không chứa logic nhạy cảm
- Không commit API keys hoặc credentials vào Git

## 📝 Cập nhật sau này

Khi cần cập nhật code:

```bash
# Sửa code trong Apps Script Editor hoặc local
clasp pull  # Pull về local (nếu sửa online)

# Hoặc sửa local và push lên
clasp push

# Deploy version mới
# Trong Apps Script Editor: Deploy > Manage deployments > Edit > Deploy
```

Không cần push lại lên GitHub trừ khi bạn thay đổi landing page!

## 🆘 Hỗ trợ

- **Repository**: https://github.com/dtnam-oss/lusty-fit-gym-management
- **Issues**: Tạo issue trên GitHub nếu gặp vấn đề

## ✨ Hoàn thành!

Sau khi hoàn tất các bước trên, bạn sẽ có:
- ✅ Landing page đẹp trên GitHub Pages
- ✅ Web App chạy trên Google Apps Script
- ✅ Hệ thống CRM đầy đủ chức năng
- ✅ URL công khai để chia sẻ

**Chúc mừng! 🎉**
