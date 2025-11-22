/**
 * Module quản lý PT (sheet: "PT").
 * Cột (kỳ vọng):
 * Id, ten_pt, so_dien_thoai, email, cccd, dia_chi, ngay_sinh, gioi_tinh,
 * so_dien_thoai_khan_cap, thoi_gian_tao, ngay_tao, thang, nam
 * Removed columns: loai_khach_hang, ma_hlv, ten_hlv
 */

/**
 * Lấy danh sách PT (không trả các hàng trống).
 * @returns {Array<Object>|Object} Mảng PT hoặc { error: msg }
 */
function getPTs() {
  try {
    var PT_SHEET = getPTSheet();
    if (!PT_SHEET) throw new Error("Sheet 'PT' không tồn tại.");
    var lastRow = PT_SHEET.getLastRow();
    if (lastRow <= 1) return [];
    var lastCol = PT_SHEET.getLastColumn();
    var rows = PT_SHEET.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var headerMap = getHeaderMap(PT_SHEET);
    var list = rows.map(function(row, idx) {
      if (row.every(function(cell){ return cell === ""; })) return null;
      
      // Đọc điểm tích lũy và hạng từ sheet
      var diemTichLuyRaw = headerMap['diem_tich_luy'] !== undefined ? row[headerMap['diem_tich_luy']] : '';
      var diemTichLuy = diemTichLuyRaw !== '' && diemTichLuyRaw !== null && diemTichLuyRaw !== undefined ? parseFloat(diemTichLuyRaw) : 0;
      if (isNaN(diemTichLuy)) diemTichLuy = 0;
      
      var hangThanhVien = headerMap['hang_thanh_vien'] !== undefined ? row[headerMap['hang_thanh_vien']] : 'Đồng';
      
      return {
        rowNumber: idx + 2,
        id: row[headerMap['Id']],
        ten_pt: row[headerMap['ten_pt']],
        so_dien_thoai: row[headerMap['so_dien_thoai']],
        email: row[headerMap['email']],
        cccd: row[headerMap['cccd']],
        dia_chi: row[headerMap['dia_chi']],
        ngay_sinh: row[headerMap['ngay_sinh']] ? new Date(row[headerMap['ngay_sinh']]).toLocaleDateString('vi-VN') : '',
        gioi_tinh: row[headerMap['gioi_tinh']],
        so_dien_thoai_khan_cap: row[headerMap['so_dien_thoai_khan_cap']],
        thoi_gian_tao: row[headerMap['thoi_gian_tao']] ? new Date(row[headerMap['thoi_gian_tao']]).toLocaleString('vi-VN') : '',
        ngay_tao: row[headerMap['ngay_tao']],
        thang: row[headerMap['thang']],
        nam: row[headerMap['nam']],
        diemTichLuy: diemTichLuy,
        hangThanhVien: hangThanhVien || 'Đồng'
      };
    }).filter(function(p){ return p; });
    return list;
  } catch (e) {
    return { error: e.message };
  }
}

/**
 * Thêm PT mới.
 * @param {Object} ptData
 * @returns {Object} { success: boolean, message }
 */
function addPT(ptData) {
  try {
    var PT_SHEET = getPTSheet();
    if (!PT_SHEET) throw new Error("Sheet 'PT' không tồn tại.");
    var now = new Date();
    var newId = ptData.id || ('PT-' + now.getTime());
    var creationTime = now;
    var creationDate = now.toLocaleDateString('vi-VN');
    var creationMonth = now.getMonth() + 1;
    var creationYear = now.getFullYear();
    // Removed: loai_khach_hang, ma_hlv, ten_hlv
    PT_SHEET.appendRow([
      newId,
      ptData.ten_pt || '',
      ptData.so_dien_thoai || '',
      ptData.email || '',
      ptData.cccd || '',
      ptData.dia_chi || '',
      ptData.ngay_sinh || '',
      ptData.gioi_tinh || '',
      ptData.so_dien_thoai_khan_cap || '',
      creationTime,
      creationDate,
      creationMonth,
      creationYear
    ]);
    return { success: true, message: 'Thêm PT thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Cập nhật PT (yêu cầu ptData.rowNumber)
 * @param {Object} ptData
 */
function updatePT(ptData) {
  try {
    var PT_SHEET = getPTSheet();
    if (!PT_SHEET) throw new Error("Sheet 'PT' không tồn tại.");
    if (!ptData.rowNumber) return { success: false, message: 'rowNumber is required' };
    var range = PT_SHEET.getRange(ptData.rowNumber, 1, 1, PT_SHEET.getLastColumn());
    var values = range.getValues()[0];
    var headerMap = getHeaderMap(PT_SHEET);
    // Update fields if header exists - removed loai_khach_hang, ma_hlv, ten_hlv
    if (headerMap['ten_pt'] !== undefined) values[headerMap['ten_pt']] = ptData.ten_pt || '';
    if (headerMap['so_dien_thoai'] !== undefined) values[headerMap['so_dien_thoai']] = ptData.so_dien_thoai || '';
    if (headerMap['email'] !== undefined) values[headerMap['email']] = ptData.email || '';
    if (headerMap['cccd'] !== undefined) values[headerMap['cccd']] = ptData.cccd || '';
    if (headerMap['dia_chi'] !== undefined) values[headerMap['dia_chi']] = ptData.dia_chi || '';
    if (headerMap['ngay_sinh'] !== undefined) values[headerMap['ngay_sinh']] = ptData.ngay_sinh || '';
    if (headerMap['gioi_tinh'] !== undefined) values[headerMap['gioi_tinh']] = ptData.gioi_tinh || '';
    if (headerMap['so_dien_thoai_khan_cap'] !== undefined) values[headerMap['so_dien_thoai_khan_cap']] = ptData.so_dien_thoai_khan_cap || '';
    range.setValues([values]);
    return { success: true, message: 'Cập nhật PT thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Xóa PT (soft delete nếu có cột IsDeleted, nếu không thì clear row)
 */
function deletePT(rowNumber) {
  try {
    var PT_SHEET = getPTSheet();
    if (!PT_SHEET) throw new Error("Sheet 'PT' không tồn tại.");
    var headerMap = getHeaderMap(PT_SHEET);
    var isDeletedIndex = headerMap['IsDeleted'];
    if (isDeletedIndex !== undefined) {
      PT_SHEET.getRange(rowNumber, isDeletedIndex + 1).setValue('YES');
    } else {
      var lastCol = PT_SHEET.getLastColumn();
      PT_SHEET.getRange(rowNumber, 1, 1, lastCol).clearContent();
    }
    return { success: true, message: 'Xóa PT thành công!' };
  } catch (e) { return { success: false, message: e.message }; }
}
