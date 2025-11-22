/**
 * Module quản lý Bảng giá (sheet: "bang_gia").
 * Cột: Id, ma_bang_gia, ten_bang_gia, don_gia, don_vi_tinh, gia_tri, 
 * vat, don_gia_vat, chiet_khau, noi_dung, thoi_han, doi_tuong_ap_dung,
 * thoi_gian_tao, ngay_tao, thang, nam
 */

/**
 * Lấy danh sách bảng giá (alias for getPriceListFull)
 * @returns {Array<Object>|Object} Mảng bảng giá hoặc { error: msg }
 */
function getPriceList() {
  return getPriceListFull();
}

/**
 * Lấy danh sách bảng giá với đầy đủ thông tin
 * @returns {Array<Object>|Object} Mảng bảng giá hoặc { error: msg }
 */
function getPriceListFull() {
  try {
    var PRICE_LIST_SHEET = getPriceListSheet();
    if (!PRICE_LIST_SHEET) throw new Error("Sheet 'bang_gia' không tồn tại.");
    var lastRow = PRICE_LIST_SHEET.getLastRow();
    if (lastRow <= 1) return [];
    var lastCol = PRICE_LIST_SHEET.getLastColumn();
    var rows = PRICE_LIST_SHEET.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var headerMap = getHeaderMap(PRICE_LIST_SHEET);
    
    var list = rows.map(function(row, idx) {
      if (row.every(function(cell){ return cell === ""; })) return null;
      return {
        rowNumber: idx + 2,
        id: row[headerMap['Id']],
        ma_bang_gia: row[headerMap['ma_bang_gia']],
        ten_bang_gia: row[headerMap['ten_bang_gia']],
        don_gia: row[headerMap['don_gia']],
        don_vi_tinh: row[headerMap['don_vi_tinh']],
        gia_tri: row[headerMap['gia_tri']] || '',
        vat: row[headerMap['vat']] || 0,
        don_gia_vat: row[headerMap['don_gia_vat']] || 0,
        chiet_khau: row[headerMap['chiet_khau']] || '',
        noi_dung: row[headerMap['noi_dung']] || '',
        thoi_han: row[headerMap['thoi_han']] || '',
        doi_tuong_ap_dung: row[headerMap['doi_tuong_ap_dung']] || '',
        thoi_gian_tao: row[headerMap['thoi_gian_tao']] ? new Date(row[headerMap['thoi_gian_tao']]).toLocaleString('vi-VN') : '',
        ngay_tao: row[headerMap['ngay_tao']],
        thang: row[headerMap['thang']],
        nam: row[headerMap['nam']]
      };
    }).filter(function(p){ return p; });
    return list;
  } catch (e) {
    return { error: e.message };
  }
}

/**
 * Thêm bảng giá mới
 * @param {Object} priceData
 * @returns {Object} { success: boolean, message }
 */
function addPriceList(priceData) {
  try {
    var PRICE_LIST_SHEET = getPriceListSheet();
    if (!PRICE_LIST_SHEET) throw new Error("Sheet 'bang_gia' không tồn tại.");
    var now = new Date();
    var newId = 'BG-' + now.getTime();
    
    var headerMap = getHeaderMap(PRICE_LIST_SHEET);
    var lastCol = PRICE_LIST_SHEET.getLastColumn();
    var newRow = new Array(lastCol).fill('');
    
    // Helper function
    function setValue(columnName, value) {
      var index = headerMap[columnName];
      if (index !== undefined) {
        newRow[index] = value || '';
      }
    }
    
    setValue('Id', newId);
    setValue('ma_bang_gia', priceData.ma_bang_gia);
    setValue('ten_bang_gia', priceData.ten_bang_gia);
    setValue('don_gia', priceData.don_gia || 0);
    setValue('don_vi_tinh', priceData.don_vi_tinh);
    setValue('gia_tri', priceData.gia_tri);
    setValue('vat', priceData.vat || 0);
    setValue('don_gia_vat', priceData.don_gia_vat || 0);
    setValue('chiet_khau', priceData.chiet_khau);
    setValue('noi_dung', priceData.noi_dung);
    setValue('thoi_han', priceData.thoi_han);
    setValue('doi_tuong_ap_dung', priceData.doi_tuong_ap_dung);
    setValue('thoi_gian_tao', now);
    setValue('ngay_tao', now.toLocaleDateString('vi-VN'));
    setValue('thang', now.getMonth() + 1);
    setValue('nam', now.getFullYear());
    
    PRICE_LIST_SHEET.appendRow(newRow);
    
    return { success: true, message: 'Thêm bảng giá thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Cập nhật bảng giá
 * @param {Object} priceData (yêu cầu priceData.rowNumber)
 */
function updatePriceList(priceData) {
  try {
    var PRICE_LIST_SHEET = getPriceListSheet();
    if (!PRICE_LIST_SHEET) throw new Error("Sheet 'bang_gia' không tồn tại.");
    if (!priceData.rowNumber) return { success: false, message: 'rowNumber is required' };
    
    var range = PRICE_LIST_SHEET.getRange(priceData.rowNumber, 1, 1, PRICE_LIST_SHEET.getLastColumn());
    var values = range.getValues()[0];
    var headerMap = getHeaderMap(PRICE_LIST_SHEET);
    
    // Update fields
    if (headerMap['ma_bang_gia'] !== undefined) values[headerMap['ma_bang_gia']] = priceData.ma_bang_gia || '';
    if (headerMap['ten_bang_gia'] !== undefined) values[headerMap['ten_bang_gia']] = priceData.ten_bang_gia || '';
    if (headerMap['don_gia'] !== undefined) values[headerMap['don_gia']] = priceData.don_gia || 0;
    if (headerMap['don_vi_tinh'] !== undefined) values[headerMap['don_vi_tinh']] = priceData.don_vi_tinh || '';
    if (headerMap['gia_tri'] !== undefined) values[headerMap['gia_tri']] = priceData.gia_tri || '';
    if (headerMap['vat'] !== undefined) values[headerMap['vat']] = priceData.vat || 0;
    if (headerMap['don_gia_vat'] !== undefined) values[headerMap['don_gia_vat']] = priceData.don_gia_vat || 0;
    if (headerMap['chiet_khau'] !== undefined) values[headerMap['chiet_khau']] = priceData.chiet_khau || '';
    if (headerMap['noi_dung'] !== undefined) values[headerMap['noi_dung']] = priceData.noi_dung || '';
    if (headerMap['thoi_han'] !== undefined) values[headerMap['thoi_han']] = priceData.thoi_han || '';
    if (headerMap['doi_tuong_ap_dung'] !== undefined) values[headerMap['doi_tuong_ap_dung']] = priceData.doi_tuong_ap_dung || '';
    
    range.setValues([values]);
    return { success: true, message: 'Cập nhật bảng giá thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Xóa bảng giá (clear row)
 */
function deletePriceList(rowNumber) {
  try {
    var PRICE_LIST_SHEET = getPriceListSheet();
    if (!PRICE_LIST_SHEET) throw new Error("Sheet 'bang_gia' không tồn tại.");
    var lastCol = PRICE_LIST_SHEET.getLastColumn();
    PRICE_LIST_SHEET.getRange(rowNumber, 1, 1, lastCol).clearContent();
    return { success: true, message: 'Xóa bảng giá thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
