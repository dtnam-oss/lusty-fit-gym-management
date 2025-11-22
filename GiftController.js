/**
 * Module quản lý Ưu đãi/Quà tặng (sheet: "qua_tang")
 * Cột: Id, ma_qua_tang, ten_qua_tang, loai_hinh, mo_ta, gia_tri, so_luong, dieu_kien_ap_dung,
 * thoi_gian_tao, ngay_tao, nguoi_tao, thang, nam, IsDeleted
 */

function getGifts() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('qua_tang');
    if (!sheet) throw new Error("Sheet 'qua_tang' không tồn tại.");
    
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
        ma_qua_tang: row[headerMap['ma_qua_tang']],
        ten_qua_tang: row[headerMap['ten_qua_tang']],
        loai_hinh: row[headerMap['loai_hinh']],
        mo_ta: row[headerMap['mo_ta']],
        gia_tri: row[headerMap['gia_tri']],
        so_luong: row[headerMap['so_luong']],
        dieu_kien_ap_dung: row[headerMap['dieu_kien_ap_dung']],
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

function addGift(data) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('qua_tang');
    if (!sheet) throw new Error("Sheet 'qua_tang' không tồn tại.");
    
    var now = new Date();
    var newId = 'QT-' + now.getTime();
    var headerMap = getHeaderMap(sheet);
    var lastCol = sheet.getLastColumn();
    var newRow = new Array(lastCol).fill('');
    
    function setValue(columnName, value) {
      var index = headerMap[columnName];
      if (index !== undefined) newRow[index] = value || '';
    }
    
    setValue('Id', newId);
    setValue('ma_qua_tang', data.ma_qua_tang);
    setValue('ten_qua_tang', data.ten_qua_tang);
    setValue('loai_hinh', data.loai_hinh);
    setValue('mo_ta', data.mo_ta);
    setValue('gia_tri', data.gia_tri || 0);
    setValue('so_luong', data.so_luong || 0);
    setValue('dieu_kien_ap_dung', data.dieu_kien_ap_dung);
    setValue('thoi_gian_tao', now);
    setValue('ngay_tao', now.toLocaleDateString('vi-VN'));
    setValue('nguoi_tao', Session.getActiveUser().getEmail());
    setValue('thang', now.getMonth() + 1);
    setValue('nam', now.getFullYear());
    setValue('IsDeleted', '');
    
    sheet.appendRow(newRow);
    return { success: true, message: 'Thêm ưu đãi/quà tặng thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function updateGift(data) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('qua_tang');
    if (!sheet) throw new Error("Sheet 'qua_tang' không tồn tại.");
    if (!data.rowNumber) return { success: false, message: 'rowNumber is required' };
    
    var range = sheet.getRange(data.rowNumber, 1, 1, sheet.getLastColumn());
    var values = range.getValues()[0];
    var headerMap = getHeaderMap(sheet);
    
    if (headerMap['ma_qua_tang'] !== undefined) values[headerMap['ma_qua_tang']] = data.ma_qua_tang || '';
    if (headerMap['ten_qua_tang'] !== undefined) values[headerMap['ten_qua_tang']] = data.ten_qua_tang || '';
    if (headerMap['loai_hinh'] !== undefined) values[headerMap['loai_hinh']] = data.loai_hinh || '';
    if (headerMap['mo_ta'] !== undefined) values[headerMap['mo_ta']] = data.mo_ta || '';
    if (headerMap['gia_tri'] !== undefined) values[headerMap['gia_tri']] = data.gia_tri || 0;
    if (headerMap['so_luong'] !== undefined) values[headerMap['so_luong']] = data.so_luong || 0;
    if (headerMap['dieu_kien_ap_dung'] !== undefined) values[headerMap['dieu_kien_ap_dung']] = data.dieu_kien_ap_dung || '';
    
    range.setValues([values]);
    return { success: true, message: 'Cập nhật ưu đãi/quà tặng thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function deleteGift(rowNumber) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('qua_tang');
    if (!sheet) throw new Error("Sheet 'qua_tang' không tồn tại.");
    var headerMap = getHeaderMap(sheet);
    var isDeletedCol = headerMap['IsDeleted'];
    if (isDeletedCol !== undefined) {
      sheet.getRange(rowNumber, isDeletedCol + 1).setValue('YES');
    }
    return { success: true, message: 'Xóa ưu đãi/quà tặng thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
