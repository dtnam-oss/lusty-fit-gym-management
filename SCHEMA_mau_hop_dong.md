# Schema cho Sheet: mau_hop_dong

## Mô tả
Sheet này lưu trữ các mẫu hợp đồng (Member và PT) để user có thể quản lý, chỉnh sửa

## Cấu trúc các cột

| Tên cột | Kiểu dữ liệu | Mô tả | Bắt buộc | Giá trị mặc định |
|---------|--------------|-------|----------|------------------|
| Id | String | ID của mẫu (TPL-timestamp) | Có | Auto-generated |
| Tên mẫu | String | Tên gọi của mẫu | Có | - |
| Loại mẫu | String | "Hội viên" hoặc "PT" | Có | - |
| Mô tả | String | Mô tả chi tiết về mẫu | Không | - |
| Nội dung HTML | Text | Nội dung HTML đầy đủ của template | Có | - |
| Trạng thái | String | "Đang sử dụng" hoặc "Không sử dụng" | Có | "Không sử dụng" |
| Ngày tạo | String | Ngày tạo (dd/MM/yyyy) | Có | Auto-generated |
| Thời gian tạo | String | Thời gian tạo (dd/MM/yyyy HH:mm:ss) | Có | Auto-generated |
| Người tạo | String | Email người tạo | Có | Auto-generated |
| Ngày cập nhật | String | Ngày cập nhật lần cuối | Không | - |
| Thời gian cập nhật | String | Thời gian cập nhật lần cuối | Không | - |
| Người cập nhật | String | Email người cập nhật | Không | - |
| IsDeleted | String | "YES" hoặc "NO" | Có | "NO" |

## Business Rules

1. **Unique Active Template**: Chỉ có 1 template với trạng thái "Đang sử dụng" cho mỗi loại (Hội viên/PT)
2. **Soft Delete**: Không xóa vật lý, chỉ đánh dấu IsDeleted = "YES"
3. **Auto Deactivation**: Khi kích hoạt template mới, tự động vô hiệu hóa template cũ cùng loại

## Hướng dẫn tạo sheet

1. Tạo sheet mới tên "mau_hop_dong"
2. Thêm header row với các cột theo thứ tự trên
3. Chạy function `migrateExistingTemplatesToDB()` để import 2 template hiện tại
