/**
 * Lấy danh sách tất cả khách hàng (chưa bị xóa mềm).
 * Updated: Use headerMap for flexible column mapping
 * @returns {Array<Object>} Mảng các đối tượng khách hàng.
 */
function getMembers() {
  try {
    var MEMBERS_SHEET = getMembersSheet();
    if (!MEMBERS_SHEET) throw new Error("Sheet 'khach_hang' không tồn tại.");
    var lastRow = MEMBERS_SHEET.getLastRow();
    if (lastRow <= 1) return [];
    var lastCol = MEMBERS_SHEET.getLastColumn();
    var rows = MEMBERS_SHEET.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var headerMap = getHeaderMap(MEMBERS_SHEET);
    
    var members = rows.map(function(row, index) {
      // Check if deleted or empty row
      var isDeleted = headerMap['IsDeleted'] !== undefined ? row[headerMap['IsDeleted']] : '';
      if (isDeleted === 'YES' || row.every(function(cell) { return cell === ""; })) return null;
      
      var dateOfBirth = row[headerMap['ngay_sinh']];
      var creationTime = row[headerMap['thoi_gian_tao']];
      
      // Đọc điểm tích lũy và hạng thành viên từ sheet (đã được ghi bởi trigger)
      var diemTichLuyRaw = headerMap['diem_tich_luy'] !== undefined ? row[headerMap['diem_tich_luy']] : '';
      var diemTichLuy = diemTichLuyRaw !== '' && diemTichLuyRaw !== null && diemTichLuyRaw !== undefined ? parseFloat(diemTichLuyRaw) : 0;
      if (isNaN(diemTichLuy)) diemTichLuy = 0;
      
      var hangThanhVien = headerMap['hang_thanh_vien'] !== undefined ? row[headerMap['hang_thanh_vien']] : 'Đồng';
      
      return {
        rowNumber: index + 2,
        id: row[headerMap['Id']],
        fullName: row[headerMap['ten_hoi_vien']],
        phoneNumber: row[headerMap['so_dien_thoai']],
        email: row[headerMap['email']],
        cccd: row[headerMap['cccd']],
        address: row[headerMap['dia_chi']],
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('vi-VN') : '',
        gender: row[headerMap['gioi_tinh']],
        ptId: row[headerMap['ma_hlv']],
        ptName: row[headerMap['ten_hlv']],
        emergencyPhone: row[headerMap['so_dien_thoai_khan_cap']],
        creationTime: creationTime ? new Date(creationTime).toLocaleString('vi-VN') : '',
        status: row[headerMap['tinh_trang']],
        diemTichLuy: diemTichLuy,
        hangThanhVien: hangThanhVien || 'Đồng'
      };
    }).filter(function(member) { return member; });
    return members;
  } catch (e) {
    return { error: e && e.message ? e.message : e.toString() };
  }
}

/**
 * Thêm một khách hàng mới.
 * Updated: Use headerMap for flexible column mapping
 * @param {Object} memberData Dữ liệu khách hàng từ form.
 * @returns {Object} Kết quả thành công hoặc lỗi.
 */
function addMember(memberData) {
  try {
    var MEMBERS_SHEET = getMembersSheet();
    if (!MEMBERS_SHEET) throw new Error("Sheet 'khach_hang' không tồn tại.");
    var now = new Date();
    var newId = "KH-" + now.getTime();
    
    var creationTime = now;
    var creationDate = now.toLocaleDateString('vi-VN');
    var creationMonth = now.getMonth() + 1;
    var creationYear = now.getFullYear();
    
    var headerMap = getHeaderMap(MEMBERS_SHEET);
    var lastCol = MEMBERS_SHEET.getLastColumn();
    var newRow = new Array(lastCol).fill('');
    
    // Helper function
    function setValue(columnName, value) {
      var index = headerMap[columnName];
      if (index !== undefined) {
        newRow[index] = value || '';
      }
    }
    
    setValue('Id', newId);
    setValue('ten_hoi_vien', memberData.fullName);
    setValue('so_dien_thoai', memberData.phoneNumber);
    setValue('email', memberData.email);
    setValue('cccd', memberData.cccd);
    setValue('dia_chi', memberData.address);
    setValue('ngay_sinh', memberData.dateOfBirth);
    setValue('gioi_tinh', memberData.gender);
    setValue('ma_hlv', memberData.ptId);
    setValue('ten_hlv', memberData.ptName);
    setValue('so_dien_thoai_khan_cap', memberData.emergencyPhone);
    setValue('thoi_gian_tao', creationTime);
    setValue('ngay_tao', creationDate);
    setValue('thang', creationMonth);
    setValue('nam', creationYear);
    setValue('tinh_trang', "Đang hoạt động");
    setValue('IsDeleted', '');
    
    MEMBERS_SHEET.appendRow(newRow);
    
    return { success: true, message: 'Thêm khách hàng thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Cập nhật thông tin khách hàng.
 * Updated: Use headerMap for flexible column mapping
 * @param {Object} memberData Dữ liệu khách hàng cần cập nhật.
 * @returns {Object} Kết quả thành công hoặc lỗi.
 */
function updateMember(memberData) {
  try {
    var MEMBERS_SHEET = getMembersSheet();
    if (!MEMBERS_SHEET) throw new Error("Sheet 'khach_hang' không tồn tại.");
    var range = MEMBERS_SHEET.getRange(memberData.rowNumber, 1, 1, MEMBERS_SHEET.getLastColumn());
    var currentValues = range.getValues()[0];
    var headerMap = getHeaderMap(MEMBERS_SHEET);

    // Update using headerMap
    if (headerMap['ten_hoi_vien'] !== undefined) currentValues[headerMap['ten_hoi_vien']] = memberData.fullName;
    if (headerMap['so_dien_thoai'] !== undefined) currentValues[headerMap['so_dien_thoai']] = memberData.phoneNumber;
    if (headerMap['email'] !== undefined) currentValues[headerMap['email']] = memberData.email;
    if (headerMap['cccd'] !== undefined) currentValues[headerMap['cccd']] = memberData.cccd;
    if (headerMap['dia_chi'] !== undefined) currentValues[headerMap['dia_chi']] = memberData.address;
    if (headerMap['ngay_sinh'] !== undefined) currentValues[headerMap['ngay_sinh']] = memberData.dateOfBirth;
    if (headerMap['gioi_tinh'] !== undefined) currentValues[headerMap['gioi_tinh']] = memberData.gender;
    if (headerMap['ma_hlv'] !== undefined) currentValues[headerMap['ma_hlv']] = memberData.ptId;
    if (headerMap['ten_hlv'] !== undefined) currentValues[headerMap['ten_hlv']] = memberData.ptName;
    if (headerMap['tinh_trang'] !== undefined) currentValues[headerMap['tinh_trang']] = memberData.status;

    range.setValues([currentValues]);

    return { success: true, message: 'Cập nhật thông tin thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Xóa một khách hàng (xóa mềm).
 * Updated: Use headerMap for flexible column mapping
 * @param {number} rowNumber Số dòng của khách hàng cần xóa.
 * @returns {Object} Kết quả thành công hoặc lỗi.
 */
function deleteMember(rowNumber) {
  try {
    var MEMBERS_SHEET = getMembersSheet();
    if (!MEMBERS_SHEET) throw new Error("Sheet 'khach_hang' không tồn tại.");
    var headerMap = getHeaderMap(MEMBERS_SHEET);
    var isDeletedCol = headerMap['IsDeleted'];
    if (isDeletedCol !== undefined) {
      MEMBERS_SHEET.getRange(rowNumber, isDeletedCol + 1).setValue('YES');
    }
    return { success: true, message: 'Xóa khách hàng thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}