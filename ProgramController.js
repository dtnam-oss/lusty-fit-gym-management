/**
 * Module quản lý Chương trình (sheet: "chuong_trinh")
 * Cột: Id, ten_chuong_trinh, mo_ta, ngay_bat_dau, ngay_ket_thuc, doi_tuong_ap_dung,
 * thoi_gian_tao, ngay_tao, nguoi_tao, thang, nam, IsDeleted
 */

function getPrograms() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('chuong_trinh');
    if (!sheet) throw new Error("Sheet 'chuong_trinh' không tồn tại.");
    
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
        ten_chuong_trinh: row[headerMap['ten_chuong_trinh']],
        mo_ta: row[headerMap['mo_ta']],
        ngay_bat_dau: row[headerMap['ngay_bat_dau']] ? new Date(row[headerMap['ngay_bat_dau']]).toLocaleDateString('vi-VN') : '',
        ngay_ket_thuc: row[headerMap['ngay_ket_thuc']] ? new Date(row[headerMap['ngay_ket_thuc']]).toLocaleDateString('vi-VN') : '',
        doi_tuong_ap_dung: row[headerMap['doi_tuong_ap_dung']],
        thoi_gian_tao: row[headerMap['thoi_gian_tao']] ? new Date(row[headerMap['thoi_gian_tao']]).toLocaleString('vi-VN') : '',
        ngay_tao: row[headerMap['ngay_tao']],
        nguoi_tao: row[headerMap['nguoi_tao']]
      };
    }).filter(function(p){ return p; });
    return list;
  } catch (e) {
    return { error: e.message };
  }
}

function addProgram(data) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('chuong_trinh');
    if (!sheet) throw new Error("Sheet 'chuong_trinh' không tồn tại.");
    
    var now = new Date();
    var newId = 'CT-' + now.getTime();
    var headerMap = getHeaderMap(sheet);
    var lastCol = sheet.getLastColumn();
    var newRow = new Array(lastCol).fill('');
    
    function setValue(columnName, value) {
      var index = headerMap[columnName];
      if (index !== undefined) newRow[index] = value || '';
    }
    
    setValue('Id', newId);
    setValue('ten_chuong_trinh', data.ten_chuong_trinh);
    setValue('mo_ta', data.mo_ta);
    setValue('ngay_bat_dau', data.ngay_bat_dau ? new Date(data.ngay_bat_dau) : '');
    setValue('ngay_ket_thuc', data.ngay_ket_thuc ? new Date(data.ngay_ket_thuc) : '');
    setValue('doi_tuong_ap_dung', data.doi_tuong_ap_dung);
    setValue('thoi_gian_tao', now);
    setValue('ngay_tao', now.toLocaleDateString('vi-VN'));
    setValue('nguoi_tao', Session.getActiveUser().getEmail());
    setValue('thang', now.getMonth() + 1);
    setValue('nam', now.getFullYear());
    setValue('IsDeleted', '');
    
    sheet.appendRow(newRow);
    return { success: true, message: 'Thêm chương trình thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function updateProgram(data) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('chuong_trinh');
    if (!sheet) throw new Error("Sheet 'chuong_trinh' không tồn tại.");
    if (!data.rowNumber) return { success: false, message: 'rowNumber is required' };
    
    var range = sheet.getRange(data.rowNumber, 1, 1, sheet.getLastColumn());
    var values = range.getValues()[0];
    var headerMap = getHeaderMap(sheet);
    
    if (headerMap['ten_chuong_trinh'] !== undefined) values[headerMap['ten_chuong_trinh']] = data.ten_chuong_trinh || '';
    if (headerMap['mo_ta'] !== undefined) values[headerMap['mo_ta']] = data.mo_ta || '';
    if (headerMap['ngay_bat_dau'] !== undefined) values[headerMap['ngay_bat_dau']] = data.ngay_bat_dau ? new Date(data.ngay_bat_dau) : '';
    if (headerMap['ngay_ket_thuc'] !== undefined) values[headerMap['ngay_ket_thuc']] = data.ngay_ket_thuc ? new Date(data.ngay_ket_thuc) : '';
    if (headerMap['doi_tuong_ap_dung'] !== undefined) values[headerMap['doi_tuong_ap_dung']] = data.doi_tuong_ap_dung || '';
    
    range.setValues([values]);
    return { success: true, message: 'Cập nhật chương trình thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function deleteProgram(rowNumber) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('chuong_trinh');
    if (!sheet) throw new Error("Sheet 'chuong_trinh' không tồn tại.");
    var headerMap = getHeaderMap(sheet);
    var isDeletedCol = headerMap['IsDeleted'];
    if (isDeletedCol !== undefined) {
      sheet.getRange(rowNumber, isDeletedCol + 1).setValue('YES');
    }
    return { success: true, message: 'Xóa chương trình thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
