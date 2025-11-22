/**
 * Module quản lý Chính sách Hội viên (sheet: "chinh_sach_hoi_vien")
 * Cột: Id, hang_thanh_vien, diem_tich_luy, chiet_khau_khm, quyen_loi, uu_dai, qua_tang,
 * thoi_gian_tao, ngay_tao, nguoi_tao, thang, nam, tinh_trang, IsDeleted
 */

function getPolicyMembers() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('chinh_sach_hoi_vien');
    if (!sheet) throw new Error("Sheet 'chinh_sach_hoi_vien' không tồn tại.");
    
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
        hang_thanh_vien: row[headerMap['hang_thanh_vien']],
        diem_tich_luy: row[headerMap['diem_tich_luy']],
        chiet_khau_khm: row[headerMap['chiet_khau_khm']],
        quyen_loi: row[headerMap['quyen_loi']],
        uu_dai: row[headerMap['uu_dai']],
        qua_tang: row[headerMap['qua_tang']],
        thoi_gian_tao: row[headerMap['thoi_gian_tao']] ? new Date(row[headerMap['thoi_gian_tao']]).toLocaleString('vi-VN') : '',
        ngay_tao: row[headerMap['ngay_tao']],
        nguoi_tao: row[headerMap['nguoi_tao']],
        tinh_trang: row[headerMap['tinh_trang']]
      };
    }).filter(function(p){ return p; });
    return list;
  } catch (e) {
    return { error: e.message };
  }
}

function addPolicyMember(data) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('chinh_sach_hoi_vien');
    if (!sheet) throw new Error("Sheet 'chinh_sach_hoi_vien' không tồn tại.");
    
    var now = new Date();
    var newId = 'CSHV-' + now.getTime();
    var headerMap = getHeaderMap(sheet);
    var lastCol = sheet.getLastColumn();
    var newRow = new Array(lastCol).fill('');
    
    function setValue(columnName, value) {
      var index = headerMap[columnName];
      if (index !== undefined) newRow[index] = value || '';
    }
    
    setValue('Id', newId);
    setValue('hang_thanh_vien', data.hang_thanh_vien);
    setValue('diem_tich_luy', data.diem_tich_luy || 0);
    setValue('chiet_khau_khm', data.chiet_khau_khm);
    setValue('quyen_loi', data.quyen_loi);
    setValue('uu_dai', data.uu_dai);
    setValue('qua_tang', data.qua_tang);
    setValue('thoi_gian_tao', now);
    setValue('ngay_tao', now.toLocaleDateString('vi-VN'));
    setValue('nguoi_tao', Session.getActiveUser().getEmail());
    setValue('thang', now.getMonth() + 1);
    setValue('nam', now.getFullYear());
    setValue('tinh_trang', data.tinh_trang || 'Đang áp dụng');
    setValue('IsDeleted', '');
    
    sheet.appendRow(newRow);
    return { success: true, message: 'Thêm chính sách hội viên thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function updatePolicyMember(data) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('chinh_sach_hoi_vien');
    if (!sheet) throw new Error("Sheet 'chinh_sach_hoi_vien' không tồn tại.");
    if (!data.rowNumber) return { success: false, message: 'rowNumber is required' };
    
    var range = sheet.getRange(data.rowNumber, 1, 1, sheet.getLastColumn());
    var values = range.getValues()[0];
    var headerMap = getHeaderMap(sheet);
    
    if (headerMap['hang_thanh_vien'] !== undefined) values[headerMap['hang_thanh_vien']] = data.hang_thanh_vien || '';
    if (headerMap['diem_tich_luy'] !== undefined) values[headerMap['diem_tich_luy']] = data.diem_tich_luy || 0;
    if (headerMap['chiet_khau_khm'] !== undefined) values[headerMap['chiet_khau_khm']] = data.chiet_khau_khm || '';
    if (headerMap['quyen_loi'] !== undefined) values[headerMap['quyen_loi']] = data.quyen_loi || '';
    if (headerMap['uu_dai'] !== undefined) values[headerMap['uu_dai']] = data.uu_dai || '';
    if (headerMap['qua_tang'] !== undefined) values[headerMap['qua_tang']] = data.qua_tang || '';
    if (headerMap['tinh_trang'] !== undefined) values[headerMap['tinh_trang']] = data.tinh_trang || '';
    
    range.setValues([values]);
    return { success: true, message: 'Cập nhật chính sách hội viên thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function deletePolicyMember(rowNumber) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('chinh_sach_hoi_vien');
    if (!sheet) throw new Error("Sheet 'chinh_sach_hoi_vien' không tồn tại.");
    var headerMap = getHeaderMap(sheet);
    var isDeletedCol = headerMap['IsDeleted'];
    if (isDeletedCol !== undefined) {
      sheet.getRange(rowNumber, isDeletedCol + 1).setValue('YES');
    }
    return { success: true, message: 'Xóa chính sách hội viên thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
