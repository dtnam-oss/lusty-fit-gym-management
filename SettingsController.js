/**
 * Module quản lý Cài đặt (sheet: "cau_hinh")
 * Cột: Id, loai_hinh, gia_tri, so_luong, quy_doi, doi_tuong, 
 * thoi_gian_tao, ngay_tao, nguoi_tao, thang, nam, tinh_trang, IsDeleted
 */

/**
 * Lấy danh sách tất cả cài đặt (chưa bị xóa mềm).
 * @returns {Array<Object>} Mảng các đối tượng cài đặt.
 */
function getSettings() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('cau_hinh');
    if (!sheet) throw new Error("Sheet 'cau_hinh' không tồn tại.");
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    var lastCol = sheet.getLastColumn();
    var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var headerMap = getHeaderMap(sheet);
    
    var list = rows.map(function(row, idx) {
      var isDeleted = headerMap['IsDeleted'] !== undefined ? row[headerMap['IsDeleted']] : '';
      if (isDeleted === 'YES' || row.every(function(cell){ return cell === ""; })) return null;
      
      return {
        rowNumber: idx + 2,
        id: row[headerMap['Id']],
        loai_hinh: row[headerMap['loai_hinh']],
        gia_tri: row[headerMap['gia_tri']],
        so_luong: row[headerMap['so_luong']],
        quy_doi: row[headerMap['quy_doi']],
        doi_tuong: row[headerMap['doi_tuong']],
        thoi_gian_tao: row[headerMap['thoi_gian_tao']] ? new Date(row[headerMap['thoi_gian_tao']]).toLocaleString('vi-VN') : '',
        ngay_tao: row[headerMap['ngay_tao']],
        nguoi_tao: row[headerMap['nguoi_tao']],
        tinh_trang: row[headerMap['tinh_trang']]
      };
    }).filter(function(s){ return s; });
    return list;
  } catch (e) {
    return { error: e.message };
  }
}

/**
 * Thêm một cài đặt mới.
 * @param {Object} data Dữ liệu cài đặt từ form.
 * @returns {Object} Kết quả thành công hoặc lỗi.
 */
function addSetting(data) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('cau_hinh');
    if (!sheet) throw new Error("Sheet 'cau_hinh' không tồn tại.");
    
    var now = new Date();
    var newId = 'CD-' + now.getTime();
    var headerMap = getHeaderMap(sheet);
    var lastCol = sheet.getLastColumn();
    var newRow = new Array(lastCol).fill('');
    
    function setValue(columnName, value) {
      var index = headerMap[columnName];
      if (index !== undefined) newRow[index] = value || '';
    }
    
    setValue('Id', newId);
    setValue('loai_hinh', data.loai_hinh);
    setValue('gia_tri', data.gia_tri || '');
    setValue('so_luong', data.so_luong || 0);
    setValue('quy_doi', data.quy_doi || '');
    setValue('doi_tuong', data.doi_tuong || '');
    setValue('thoi_gian_tao', now);
    setValue('ngay_tao', now.toLocaleDateString('vi-VN'));
    setValue('nguoi_tao', Session.getActiveUser().getEmail());
    setValue('thang', now.getMonth() + 1);
    setValue('nam', now.getFullYear());
    setValue('tinh_trang', data.tinh_trang || 'Đang áp dụng');
    setValue('IsDeleted', '');
    
    sheet.appendRow(newRow);
    return { success: true, message: 'Thêm cài đặt thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Cập nhật một cài đặt.
 * @param {Object} data Dữ liệu cài đặt từ form.
 * @returns {Object} Kết quả thành công hoặc lỗi.
 */
function updateSetting(data) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('cau_hinh');
    if (!sheet) throw new Error("Sheet 'cau_hinh' không tồn tại.");
    if (!data.rowNumber) return { success: false, message: 'rowNumber is required' };
    
    var range = sheet.getRange(data.rowNumber, 1, 1, sheet.getLastColumn());
    var values = range.getValues()[0];
    var headerMap = getHeaderMap(sheet);
    
    if (headerMap['loai_hinh'] !== undefined) values[headerMap['loai_hinh']] = data.loai_hinh || '';
    if (headerMap['gia_tri'] !== undefined) values[headerMap['gia_tri']] = data.gia_tri || '';
    if (headerMap['so_luong'] !== undefined) values[headerMap['so_luong']] = data.so_luong || 0;
    if (headerMap['quy_doi'] !== undefined) values[headerMap['quy_doi']] = data.quy_doi || '';
    if (headerMap['doi_tuong'] !== undefined) values[headerMap['doi_tuong']] = data.doi_tuong || '';
    if (headerMap['tinh_trang'] !== undefined) values[headerMap['tinh_trang']] = data.tinh_trang || '';
    
    range.setValues([values]);
    return { success: true, message: 'Cập nhật cài đặt thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Xóa mềm một cài đặt.
 * @param {number} rowNumber Số dòng của cài đặt cần xóa.
 * @returns {Object} Kết quả thành công hoặc lỗi.
 */
function deleteSetting(rowNumber) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('cau_hinh');
    if (!sheet) throw new Error("Sheet 'cau_hinh' không tồn tại.");
    
    var headerMap = getHeaderMap(sheet);
    var isDeletedIndex = headerMap['IsDeleted'];
    
    if (isDeletedIndex !== undefined) {
      sheet.getRange(rowNumber, isDeletedIndex + 1).setValue('YES');
    } else {
      throw new Error("Cột 'IsDeleted' không tồn tại trong sheet.");
    }
    
    return { success: true, message: 'Xóa cài đặt thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
