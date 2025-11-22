/**
 * Module quản lý Phiếu thu (sheet: "phieu_thu")
 * Cột: Id, ma_hop_dong, ma_khach_hang, ten_khach_hang, so_dien_thoai, email, cccd, tong_thu, lan_thu,
 * thoi_gian_tao, ngay_tao, nguoi_tao, thang, nam, tinh_trang, IsDeleted
 */

function getReceipts() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('phieu_thu');
    if (!sheet) throw new Error("Sheet 'phieu_thu' không tồn tại.");
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    var lastCol = sheet.getLastColumn();
    var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var headerMap = getHeaderMap(sheet);
    
    var list = rows.map(function(row, idx) {
      var isDeleted = headerMap['IsDeleted'] !== undefined ? row[headerMap['IsDeleted']] : '';
      if (isDeleted === 'YES' || row.every(function(cell){ return cell === ""; })) return null;
      
      var thoiGianTao = row[headerMap['thoi_gian_tao']];
      var thoiGianTaoFormatted = '';
      if (thoiGianTao) {
        try {
          thoiGianTaoFormatted = new Date(thoiGianTao).toLocaleString('vi-VN');
        } catch (dateErr) {
          thoiGianTaoFormatted = String(thoiGianTao);
        }
      }
      
      return {
        rowNumber: idx + 2,
        id: row[headerMap['Id']] || '',
        ma_hop_dong: row[headerMap['ma_hop_dong']] || '',
        ma_khach_hang: row[headerMap['ma_khach_hang']] || '',
        ten_khach_hang: row[headerMap['ten_khach_hang']] || '',
        so_dien_thoai: row[headerMap['so_dien_thoai']] || '',
        email: row[headerMap['email']] || '',
        cccd: row[headerMap['cccd']] || '',
        tong_thu: row[headerMap['tong_thu']] || 0,
        lan_thu: row[headerMap['lan_thu']] || 0,
        thoi_gian_tao: thoiGianTaoFormatted,
        ngay_tao: row[headerMap['ngay_tao']] || '',
        nguoi_tao: row[headerMap['nguoi_tao']] || '',
        tinh_trang: row[headerMap['tinh_trang']] || '',
        thang: row[headerMap['thang']] || '',
        nam: row[headerMap['nam']] || ''
      };
    }).filter(function(p){ return p; });
    return list;
  } catch (e) {
    return { error: e.message };
  }
}

/**
 * Lấy lịch sử thanh toán theo mã hợp đồng
 * @param {string} contractId Mã hợp đồng
 * @returns {Array<Object>} Danh sách phiếu thu của hợp đồng
 */
function getReceiptsByContractId(contractId) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('phieu_thu');
    if (!sheet) throw new Error("Sheet 'phieu_thu' không tồn tại.");
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    
    var lastCol = sheet.getLastColumn();
    var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var headerMap = getHeaderMap(sheet);
    
    var list = rows.map(function(row, idx) {
      var isDeleted = headerMap['IsDeleted'] !== undefined ? row[headerMap['IsDeleted']] : '';
      var maHopDong = row[headerMap['ma_hop_dong']] || '';
      
      // Chỉ lấy các phiếu thu của hợp đồng này và chưa bị xóa
      if (isDeleted === 'YES' || maHopDong !== contractId) return null;
      if (row.every(function(cell){ return cell === ""; })) return null;
      
      var thoiGianTao = row[headerMap['thoi_gian_tao']];
      var thoiGianTaoFormatted = '';
      if (thoiGianTao) {
        try {
          thoiGianTaoFormatted = new Date(thoiGianTao).toLocaleString('vi-VN');
        } catch (dateErr) {
          thoiGianTaoFormatted = String(thoiGianTao);
        }
      }
      
      // Format ngay_tao if it's a Date object
      var ngayTao = row[headerMap['ngay_tao']];
      var ngayTaoFormatted = '';
      if (ngayTao) {
        if (ngayTao instanceof Date) {
          ngayTaoFormatted = ngayTao.toLocaleDateString('vi-VN');
        } else {
          ngayTaoFormatted = String(ngayTao);
        }
      }
      
      return {
        rowNumber: idx + 2,
        id: String(row[headerMap['Id']] || ''),
        ma_hop_dong: String(maHopDong),
        ma_khach_hang: String(row[headerMap['ma_khach_hang']] || ''),
        ten_khach_hang: String(row[headerMap['ten_khach_hang']] || ''),
        so_dien_thoai: String(row[headerMap['so_dien_thoai']] || ''),
        email: String(row[headerMap['email']] || ''),
        cccd: String(row[headerMap['cccd']] || ''),
        tong_thu: Number(row[headerMap['tong_thu']] || 0),
        lan_thu: Number(row[headerMap['lan_thu']] || 0),
        thoi_gian_tao: String(thoiGianTaoFormatted),
        ngay_tao: String(ngayTaoFormatted),
        nguoi_tao: String(row[headerMap['nguoi_tao']] || ''),
        tinh_trang: String(row[headerMap['tinh_trang']] || ''),
        thang: Number(row[headerMap['thang']] || 0),
        nam: Number(row[headerMap['nam']] || 0)
      };
    }).filter(function(p){ return p; });
    
    // Sắp xếp theo lần thu (mới nhất trước)
    list.sort(function(a, b) {
      return b.lan_thu - a.lan_thu;
    });
    
    return list;
  } catch (e) {
    return { error: e.message };
  }
}

function addReceipt(data) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('phieu_thu');
    if (!sheet) throw new Error("Sheet 'phieu_thu' không tồn tại.");
    
    var now = new Date();
    var newId = 'PT-' + now.getTime();
    var headerMap = getHeaderMap(sheet);
    var lastCol = sheet.getLastColumn();
    var newRow = new Array(lastCol).fill('');
    
    function setValue(columnName, value) {
      var index = headerMap[columnName];
      if (index !== undefined) newRow[index] = value || '';
    }
    
    setValue('Id', newId);
    setValue('ma_hop_dong', data.ma_hop_dong);
    setValue('ma_khach_hang', data.ma_khach_hang);
    setValue('ten_khach_hang', data.ten_khach_hang);
    setValue('so_dien_thoai', data.so_dien_thoai);
    setValue('email', data.email);
    setValue('cccd', data.cccd);
    setValue('tong_thu', data.tong_thu || 0);
    setValue('lan_thu', data.lan_thu || 1);
    setValue('thoi_gian_tao', now);
    setValue('ngay_tao', now.toLocaleDateString('vi-VN'));
    setValue('nguoi_tao', Session.getActiveUser().getEmail());
    setValue('thang', now.getMonth() + 1);
    setValue('nam', now.getFullYear());
    setValue('tinh_trang', data.tinh_trang || 'Đã thu');
    setValue('IsDeleted', '');
    
    sheet.appendRow(newRow);
    
    // Cập nhật thông tin thanh toán trong bảng hop_dong
    updateContractPaymentStatus(data.ma_hop_dong);
    
    return { success: true, message: 'Thêm phiếu thu thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function updateReceipt(data) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('phieu_thu');
    if (!sheet) throw new Error("Sheet 'phieu_thu' không tồn tại.");
    if (!data.rowNumber) return { success: false, message: 'rowNumber is required' };
    
    var range = sheet.getRange(data.rowNumber, 1, 1, sheet.getLastColumn());
    var values = range.getValues()[0];
    var headerMap = getHeaderMap(sheet);
    
    if (headerMap['ma_hop_dong'] !== undefined) values[headerMap['ma_hop_dong']] = data.ma_hop_dong || '';
    if (headerMap['ma_khach_hang'] !== undefined) values[headerMap['ma_khach_hang']] = data.ma_khach_hang || '';
    if (headerMap['ten_khach_hang'] !== undefined) values[headerMap['ten_khach_hang']] = data.ten_khach_hang || '';
    if (headerMap['so_dien_thoai'] !== undefined) values[headerMap['so_dien_thoai']] = data.so_dien_thoai || '';
    if (headerMap['email'] !== undefined) values[headerMap['email']] = data.email || '';
    if (headerMap['cccd'] !== undefined) values[headerMap['cccd']] = data.cccd || '';
    if (headerMap['tong_thu'] !== undefined) values[headerMap['tong_thu']] = data.tong_thu || 0;
    if (headerMap['lan_thu'] !== undefined) values[headerMap['lan_thu']] = data.lan_thu || 1;
    if (headerMap['tinh_trang'] !== undefined) values[headerMap['tinh_trang']] = data.tinh_trang || '';
    
    range.setValues([values]);
    
    // Cập nhật thông tin thanh toán trong bảng hop_dong
    updateContractPaymentStatus(data.ma_hop_dong);
    
    return { success: true, message: 'Cập nhật phiếu thu thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function deleteReceipt(rowNumber) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('phieu_thu');
    if (!sheet) throw new Error("Sheet 'phieu_thu' không tồn tại.");
    
    var headerMap = getHeaderMap(sheet);
    
    // Get contract ID before deleting
    var contractId = sheet.getRange(rowNumber, headerMap['ma_hop_dong'] + 1).getValue();
    
    var isDeletedCol = headerMap['IsDeleted'];
    if (isDeletedCol !== undefined) {
      sheet.getRange(rowNumber, isDeletedCol + 1).setValue('YES');
    }
    
    // Cập nhật thông tin thanh toán trong bảng hop_dong sau khi xóa
    if (contractId) {
      updateContractPaymentStatus(contractId);
    }
    
    return { success: true, message: 'Xóa phiếu thu thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Helper function to convert number to Vietnamese words
 */
function numberToVietnameseWords(num) {
  try {
    if (!num || num === 0) return 'Không đồng';
    
    // Round to integer
    num = Math.round(num);
    
    var ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    var teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];
    var tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
    
    function convertLessThanOneThousand(n) {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      
      var ten = Math.floor(n / 10);
      var one = n % 10;
      
      if (one === 0) return tens[ten];
      if (one === 5 && ten > 1) return tens[ten] + ' lăm';
      if (one === 1 && ten > 1) return tens[ten] + ' mốt';
      return tens[ten] + ' ' + ones[one];
    }
    
    // For numbers less than 1000
    if (num < 1000) {
      var hundred = Math.floor(num / 100);
      var rest = num % 100;
      var result = '';
      
      if (hundred > 0) {
        result = ones[hundred] + ' trăm';
        if (rest > 0) {
          if (rest < 10) result += ' lẻ';
          result += ' ' + convertLessThanOneThousand(rest);
        }
      } else {
        result = convertLessThanOneThousand(rest);
      }
      
      return result.trim().charAt(0).toUpperCase() + result.trim().slice(1) + ' đồng';
    }
    
    // For larger numbers
    var billion = Math.floor(num / 1000000000);
    var million = Math.floor((num % 1000000000) / 1000000);
    var thousand = Math.floor((num % 1000000) / 1000);
    var remainder = num % 1000;
    
    var result = '';
    
    if (billion > 0) {
      result += convertLessThanOneThousand(billion) + ' tỷ ';
    }
    
    if (million > 0) {
      result += convertLessThanOneThousand(million) + ' triệu ';
    }
    
    if (thousand > 0) {
      result += convertLessThanOneThousand(thousand) + ' nghìn ';
    }
    
    if (remainder > 0) {
      if (remainder < 10 && (billion > 0 || million > 0 || thousand > 0)) {
        result += 'lẻ ';
      } else if (remainder < 100 && (billion > 0 || million > 0 || thousand > 0)) {
        result += 'không trăm lẻ ';
      }
      result += convertLessThanOneThousand(remainder);
    }
    
    // Clean up and capitalize
    result = result.trim().replace(/\s+/g, ' ');
    return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
  } catch (e) {
    return 'Lỗi chuyển đổi số';
  }
}

function printReceipt(receiptData) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Get contract details from hop_dong sheet
    var contractSheet = ss.getSheetByName('hop_dong');
    if (!contractSheet) throw new Error("Sheet 'hop_dong' không tồn tại.");
    
    var contractHeaderMap = getHeaderMap(contractSheet);
    var contractRows = contractSheet.getRange(2, 1, contractSheet.getLastRow() - 1, contractSheet.getLastColumn()).getValues();
    
    var contract = null;
    for (var i = 0; i < contractRows.length; i++) {
      if (contractRows[i][contractHeaderMap['Id']] === receiptData.ma_hop_dong) {
        contract = contractRows[i];
        break;
      }
    }
    
    if (!contract) throw new Error("Không tìm thấy hợp đồng!");
    
    // Create template object with all needed data
    var templateData = {
      // Company info
      branch_code: 'CN-TayHo-001',
      company_email: 'lustyfit.dangthaimai@gmail.com',
      company_phone: '0899 991 992',
      
      // Contract & customer info
      contract_no: receiptData.ma_hop_dong || '',
      member_no: receiptData.ma_khach_hang || '',
      customer_name: receiptData.ten_khach_hang || '',
      customer_id: receiptData.cccd || '',
      customer_phone: receiptData.so_dien_thoai || '',
      customer_email: receiptData.email || '',
      
      // Sale & date info
      sale_person: contract[contractHeaderMap['nguoi_tao']] || '',
      purchase_date: contract[contractHeaderMap['ngay_tao']] ? new Date(contract[contractHeaderMap['ngay_tao']]).toLocaleDateString('vi-VN') : '',
      
      // Contract details
      detail_contract: receiptData.ma_hop_dong || '',
      detail_package: contract[contractHeaderMap['ten_bang_gia']] || '',
      detail_promotion: contract[contractHeaderMap['chiet_khau']] || '',
      detail_activation: contract[contractHeaderMap['thoi_gian_bat_dau']] ? new Date(contract[contractHeaderMap['thoi_gian_bat_dau']]).toLocaleDateString('vi-VN') : '',
      detail_expiration: contract[contractHeaderMap['thoi_gian_ket_thuc']] ? new Date(contract[contractHeaderMap['thoi_gian_ket_thuc']]).toLocaleDateString('vi-VN') : '',
      
      // Payment info
      total_amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(receiptData.tong_thu || 0),
      receipt_time: receiptData.lan_thu || 1,
      amount_in_word: '',
      remaining_amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract[contractHeaderMap['con_phai_thu']] || 0)
    };
    
    // Convert amount to words separately with error handling
    try {
      templateData.amount_in_word = numberToVietnameseWords(receiptData.tong_thu || 0);
    } catch (convertError) {
      templateData.amount_in_word = 'Lỗi chuyển đổi';
    }
    
    var template = HtmlService.createTemplateFromFile('phieu_thu');
    
    // Assign all template variables
    Object.keys(templateData).forEach(function(key) {
      template[key] = templateData[key];
    });
    
    var htmlOutput = template.evaluate().getContent();
    
    return htmlOutput;
  } catch (e) {
    throw new Error('Lỗi in phiếu thu: ' + e.message);
  }
}

/**
 * Cập nhật tình trạng thanh toán của hợp đồng
 * Tính tổng đã thu và cập nhật con_phai_thu, tinh_trang_thanh_toan
 */
function updateContractPaymentStatus(contractId) {
  try {
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Get contract info
    var contractSheet = ss.getSheetByName('hop_dong');
    if (!contractSheet) {
      return;
    }
    
    var contractHeaderMap = getHeaderMap(contractSheet);
    var contractRows = contractSheet.getRange(2, 1, contractSheet.getLastRow() - 1, contractSheet.getLastColumn()).getValues();
    
    var contractRowIndex = -1;
    var totalPayment = 0;
    
    // Find contract
    for (var i = 0; i < contractRows.length; i++) {
      if (contractRows[i][contractHeaderMap['Id']] === contractId) {
        contractRowIndex = i + 2; // +2 because array is 0-indexed and sheet starts at row 2
        totalPayment = parseFloat(contractRows[i][contractHeaderMap['tong_thanh_toan']] || 0);
        break;
      }
    }
    
    if (contractRowIndex === -1) {
      return; // Contract not found
    }
    
    // Calculate total received from receipts
    var receiptSheet = ss.getSheetByName('phieu_thu');
    if (!receiptSheet) {
      return;
    }
    
    var receiptHeaderMap = getHeaderMap(receiptSheet);
    var receiptRows = receiptSheet.getRange(2, 1, receiptSheet.getLastRow() - 1, receiptSheet.getLastColumn()).getValues();
    
    var totalReceived = 0;
    var receiptCount = 0;
    for (var j = 0; j < receiptRows.length; j++) {
      var isDeleted = receiptRows[j][receiptHeaderMap['IsDeleted']];
      var receiptContractId = receiptRows[j][receiptHeaderMap['ma_hop_dong']];
      var receiptStatus = receiptRows[j][receiptHeaderMap['tinh_trang']];
      var receiptAmount = receiptRows[j][receiptHeaderMap['tong_thu']];
      
      if (isDeleted !== 'YES' && receiptContractId === contractId && receiptStatus === 'Đã thu') {
        totalReceived += parseFloat(receiptAmount || 0);
        receiptCount++;
      }
    }
    
    
    // Calculate remaining
    var remaining = totalPayment - totalReceived;
    
    // Determine payment status
    var paymentStatus = '';
    if (totalReceived === 0) {
      paymentStatus = 'Chưa thanh toán';
    } else if (remaining <= 0) {
      paymentStatus = 'Đã thanh toán đủ';
      remaining = 0;
    } else {
      paymentStatus = 'Thanh toán một phần';
    }
    
    
    // Update contract
    if (contractHeaderMap['con_phai_thu'] !== undefined) {
      contractSheet.getRange(contractRowIndex, contractHeaderMap['con_phai_thu'] + 1).setValue(remaining);
    } else {
    }
    
    if (contractHeaderMap['tinh_trang_thanh_toan'] !== undefined) {
      contractSheet.getRange(contractRowIndex, contractHeaderMap['tinh_trang_thanh_toan'] + 1).setValue(paymentStatus);
    } else {
    }
    
    
  } catch (e) {
  }
}
