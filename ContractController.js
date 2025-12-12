/**
 * DEBUG: Function để kiểm tra column mapping của sheet hop_dong
 * Gọi function này từ Apps Script Editor để debug
 */
function debugContractColumns() {
  var CONTRACTS_SHEET = getContractsSheet();
  if (!CONTRACTS_SHEET) {
    return;
  }
  
  var lastCol = CONTRACTS_SHEET.getLastColumn();
  var headers = CONTRACTS_SHEET.getRange(1, 1, 1, lastCol).getValues()[0];
  
  
  for (var i = 0; i < headers.length; i++) {
  }
  
  var headerMap = getHeaderMap(CONTRACTS_SHEET);
  
  return {
    totalColumns: lastCol,
    headers: headers,
    headerMap: headerMap
  };
}

/**
 * Lấy toàn bộ danh sách các gói trong bảng giá.
 * @returns {Array<Object>} Mảng các đối tượng gói tập.
 */
function getPriceList() {
  try {
    var PRICE_LIST_SHEET = getPriceListSheet();
    if (!PRICE_LIST_SHEET) throw new Error("Sheet 'bang_gia' không tồn tại.");
    var lastRow = PRICE_LIST_SHEET.getLastRow();
    if (lastRow <= 1) return [];
    var lastCol = PRICE_LIST_SHEET.getLastColumn();
    var rows = PRICE_LIST_SHEET.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var headerMap = getHeaderMap(PRICE_LIST_SHEET);
    var priceList = rows.map(function(row) {
      if (row.every(function(cell){ return cell === ""; })) return null;
      return {
        ma_bang_gia: row[headerMap['ma_bang_gia']],
        ten_bang_gia: row[headerMap['ten_bang_gia']],
        don_gia: row[headerMap['don_gia']],
        don_vi_tinh: row[headerMap['don_vi_tinh']],
        vat: row[headerMap['vat']],
        don_gia_vat: row[headerMap['don_gia_vat']],
        chiet_khau: row[headerMap['chiet_khau']],
        uu_dai: row[headerMap['uu_dai']] || '',
        noi_dung: row[headerMap['noi_dung']],
        thoi_han: row[headerMap['thoi_han']],
        doi_tuong_ap_dung: row[headerMap['doi_tuong_ap_dung']]
      };
    }).filter(function(item){ return item; });
    return priceList;
  } catch(e) {
    return { error: e.message };
  }
}

/**
 * Lấy danh sách hợp đồng (chưa bị xóa).
 * @returns {Array<Object>}
 */
function getContracts() {
    try {
    var CONTRACTS_SHEET = getContractsSheet();
    if (!CONTRACTS_SHEET) throw new Error("Sheet 'hop_dong' không tồn tại.");
    var lastRow = CONTRACTS_SHEET.getLastRow();
    if (lastRow <= 1) return [];
    var lastCol = CONTRACTS_SHEET.getLastColumn();
    var rows = CONTRACTS_SHEET.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var headerMap = getHeaderMap(CONTRACTS_SHEET);
    var isDeletedIndex = headerMap['IsDeleted'];
    var contracts = rows.map(function(row, idx) {
      if (isDeletedIndex !== undefined && row[isDeletedIndex] === 'YES') return null;
      if (row.every(function(cell){ return cell === ""; })) return null;
      var startDate = row[headerMap['thoi_gian_bat_dau']];
      var endDate = row[headerMap['thoi_gian_ket_thuc']];
      return {
        rowNumber: idx + 2,
        id: row[headerMap['Id']],
        customerId: row[headerMap['ma_khach_hang']],
        customerName: row[headerMap['ten_khach_hang']],
        packageName: row[headerMap['ten_bang_gia']],
        startDate: startDate ? new Date(startDate).toLocaleDateString('vi-VN') : '',
        endDate: endDate ? new Date(endDate).toLocaleDateString('vi-VN') : '',
        totalAmount: row[headerMap['don_gia_vat']],
        totalPayment: row[headerMap['tong_thanh_toan']] || 0,
        remainingPayment: row[headerMap['con_phai_thu']] || 0,
        paymentStatus: row[headerMap['tinh_trang_thanh_toan']] || '',
        status: row[headerMap['tinh_trang']],
        contractType: row[headerMap['loai_hop_dong']],
        phoneNumber: row[headerMap['so_dien_thoai']],
        email: row[headerMap['email']],
        cccd: row[headerMap['cccd']],
        address: row[headerMap['dia_chi']],
        dateOfBirth: row[headerMap['ngay_sinh']],
        gender: row[headerMap['gioi_tinh']]
      };
    }).filter(function(c){ return c; });

    return contracts;
    } catch(e) {
        return { error: e.message };
    }
}
/**
 * Lấy thông tin chi tiết của một hợp đồng để sửa.
 * @param {number} rowNumber Số dòng của hợp đồng.
 * @returns {Object} Dữ liệu chi tiết của hợp đồng.
 */
function getContractByRow(rowNumber) {
    try {
        
        if (!rowNumber || rowNumber < 2) {
            return { success: false, message: 'Số dòng không hợp lệ.' };
        }
        
        var CONTRACTS_SHEET = getContractsSheet();
        if (!CONTRACTS_SHEET) {
            return { success: false, message: "Sheet 'hop_dong' không tồn tại." };
        }
        
        var lastRow = CONTRACTS_SHEET.getLastRow();
        if (rowNumber > lastRow) {
            return { success: false, message: 'Hợp đồng không tồn tại.' };
        }
        
        var headers = CONTRACTS_SHEET.getRange(1, 1, 1, CONTRACTS_SHEET.getLastColumn()).getValues()[0];
        var rowData = CONTRACTS_SHEET.getRange(rowNumber, 1, 1, CONTRACTS_SHEET.getLastColumn()).getValues()[0];
        
        var contract = {};
        headers.forEach((header, index) => { 
            var value = rowData[index];
            
            // Convert Date objects to dd/mm/yyyy string format
            if (value instanceof Date) {
                var day = ('0' + value.getDate()).slice(-2);
                var month = ('0' + (value.getMonth() + 1)).slice(-2);
                var year = value.getFullYear();
                contract[header] = day + '/' + month + '/' + year;
            } else {
                contract[header] = value;
            }
        });
        
        
        // Xử lý giá: Ưu tiên gia_tri nếu có, nếu không thì dùng don_gia
        // Để frontend linh hoạt xử lý dựa trên loại PT trong dữ liệu ma_khach_hang/ma_hlv
        if (contract['gia_tri'] && contract['gia_tri'] > 0) {
            contract['don_gia'] = contract['gia_tri'];
        } else {
        }
        
        return { success: true, data: contract };
    } catch (e) { 
        return { success: false, message: e.message || 'Lỗi không xác định.' }; 
    }
}


/**
 * Thêm một hợp đồng mới.
 * @param {Object} contractData Dữ liệu hợp đồng từ form.
 */
function addContract(contractData) {
  try {
    var CONTRACTS_SHEET = getContractsSheet();
    if (!CONTRACTS_SHEET) throw new Error("Sheet 'hop_dong' không tồn tại.");
    var now = new Date();
    
    // Generate contract ID based on contract type
    var contractType = contractData.loai_hop_dong || 'Hội viên';
    var prefix = (contractType === 'Hội viên') ? 'HĐHV' : 'HĐPT';
    var randomNum = Math.floor(1000 + Math.random() * 9000);
    var newId = prefix + randomNum;
    
    // Get header mapping (single call)
    var headerMap = getHeaderMap(CONTRACTS_SHEET);
    var lastCol = CONTRACTS_SHEET.getLastColumn();
    var newRow = new Array(lastCol).fill('');
    
    // Helper function to safely set value
    function setValue(columnName, value) {
      var index = headerMap[columnName];
      if (index !== undefined) {
        newRow[index] = value || '';
      } else {
      }
    }
    
    // Map all data fields in exact order as your column list
    setValue('Id', newId);
    setValue('ma_khach_hang', contractData.ma_khach_hang);
    setValue('ten_khach_hang', contractData.ten_khach_hang);
    setValue('ma_hlv', contractData.ma_hlv);
    setValue('ten_hlv', contractData.ten_hlv);
    setValue('ma_bang_gia', contractData.ma_bang_gia);
    setValue('ten_bang_gia', contractData.ten_bang_gia);
    setValue('noi_dung', contractData.noi_dung);
    setValue('thoi_gian', contractData.thoi_gian);
    setValue('uu_dai', contractData.uu_dai);
    
    // Xử lý khác nhau cho hợp đồng PT và Hội viên
    var contractType = contractData.loai_hop_dong || 'Hội viên';
    if (contractType === 'PT') {
      // Hợp đồng PT: Fill cột gia_tri
      setValue('gia_tri', contractData.don_gia || 0);
      setValue('don_gia', ''); // Để trống
    } else {
      // Hợp đồng Hội viên: Fill cột don_gia
      setValue('don_gia', contractData.don_gia || 0);
      setValue('gia_tri', ''); // Để trống
    }
    
    setValue('don_vi_tinh', contractData.don_vi_tinh);
    setValue('so_luong', contractData.so_luong || 1);
    setValue('vat', contractData.vat || 0);
    setValue('don_gia_vat', contractData.don_gia_vat || 0);
    setValue('chiet_khau', contractData.chiet_khau);
    setValue('tong_thanh_toan', contractData.tong_thanh_toan || 0);
    setValue('thanh_vien', contractData.thanh_vien);
    setValue('thoi_gian_bat_dau', contractData.thoi_gian_bat_dau);
    setValue('thoi_gian_ket_thuc', contractData.thoi_gian_ket_thuc);
    setValue('tinh_trang', contractData.tinh_trang);
    setValue('thoi_gian_tao', now);
    setValue('ngay_tao', now.toLocaleDateString('vi-VN'));
    setValue('thang', now.getMonth() + 1);
    setValue('nam', now.getFullYear());
    setValue('so_dien_thoai', contractData.so_dien_thoai);
    setValue('email', contractData.email);
    setValue('cccd', contractData.cccd);
    setValue('dia_chi', contractData.dia_chi);
    setValue('ngay_sinh', contractData.ngay_sinh);
    setValue('gioi_tinh', contractData.gioi_tinh);
    setValue('nguoi_tao', Session.getActiveUser().getEmail());
    setValue('loai_hop_dong', contractType);
    setValue('con_phai_thu', contractData.tong_thanh_toan || 0);
    setValue('tinh_trang_thanh_toan', 'Chưa thu đủ');
    setValue('IsDeleted', '');
    
    // Log for debugging
    
    CONTRACTS_SHEET.appendRow(newRow);
    
    // Tự động cập nhật điểm tích lũy cho khách hàng và PT
    try {
      if (typeof onContractChange === 'function') {
        onContractChange(contractData.ma_khach_hang, contractData.ma_hlv);
      }
    } catch (triggerError) {
      // Không fail toàn bộ operation nếu trigger lỗi
    }
    
    return { success: true, message: 'Thêm hợp đồng thành công!' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Cập nhật một hợp đồng đã có.
 * @param {Object} contractData Dữ liệu hợp đồng từ form (bao gồm rowNumber).
 */
function updateContract(contractData) {
    try {
        
        var CONTRACTS_SHEET = getContractsSheet();
        if (!CONTRACTS_SHEET) throw new Error("Sheet 'hop_dong' không tồn tại.");
        
        // Validate rowNumber
        if (!contractData.rowNumber || contractData.rowNumber < 2) {
            throw new Error('Số dòng không hợp lệ.');
        }
        
        var lastRow = CONTRACTS_SHEET.getLastRow();
        if (contractData.rowNumber > lastRow) {
            throw new Error('Hợp đồng không tồn tại.');
        }
        
        var range = CONTRACTS_SHEET.getRange(contractData.rowNumber, 1, 1, CONTRACTS_SHEET.getLastColumn());
        var values = range.getValues()[0];
        var headerMap = getHeaderMap(CONTRACTS_SHEET);
        
        // Kiểm tra hợp đồng đã bị xóa chưa
        var isDeletedIndex = headerMap['IsDeleted'];
        if (isDeletedIndex !== undefined && values[isDeletedIndex] === 'YES') {
            throw new Error('Không thể cập nhật hợp đồng đã bị xóa.');
        }
        
        // Helper function to safely set value
        function setValue(columnName, value) {
            var index = headerMap[columnName];
            if (index !== undefined) {
                values[index] = value !== undefined ? value : '';
            } else {
            }
        }
        
        // Cập nhật tất cả các trường dữ liệu
        setValue('ma_khach_hang', contractData.ma_khach_hang);
        setValue('ten_khach_hang', contractData.ten_khach_hang);
        setValue('ma_hlv', contractData.ma_hlv);
        setValue('ten_hlv', contractData.ten_hlv);
        setValue('ma_bang_gia', contractData.ma_bang_gia);
        setValue('ten_bang_gia', contractData.ten_bang_gia);
        setValue('noi_dung', contractData.noi_dung);
        setValue('thoi_gian', contractData.thoi_gian);
        setValue('uu_dai', contractData.uu_dai);
        setValue('don_vi_tinh', contractData.don_vi_tinh);
        setValue('so_luong', contractData.so_luong);
        setValue('vat', contractData.vat);
        setValue('chiet_khau', contractData.chiet_khau);
        setValue('thanh_vien', contractData.thanh_vien);
        setValue('thoi_gian_bat_dau', contractData.thoi_gian_bat_dau);
        setValue('thoi_gian_ket_thuc', contractData.thoi_gian_ket_thuc);
        setValue('tinh_trang', contractData.tinh_trang);
        setValue('tong_thanh_toan', contractData.tong_thanh_toan || 0);
        setValue('don_gia_vat', contractData.don_gia_vat || 0);
        setValue('con_phai_thu', contractData.con_phai_thu || values[headerMap['con_phai_thu']]);
        setValue('tinh_trang_thanh_toan', contractData.tinh_trang_thanh_toan || values[headerMap['tinh_trang_thanh_toan']]);
        
        // Cập nhật thông tin cá nhân
        setValue('so_dien_thoai', contractData.so_dien_thoai);
        setValue('email', contractData.email);
        setValue('cccd', contractData.cccd);
        setValue('dia_chi', contractData.dia_chi);
        setValue('ngay_sinh', contractData.ngay_sinh);
        setValue('gioi_tinh', contractData.gioi_tinh);
        
        // Xử lý đơn giá dựa trên loại hợp đồng
        var contractType = values[headerMap['loai_hop_dong']];
        if (contractType === 'PT') {
            // Hợp đồng PT: lưu vào cột gia_tri
            setValue('gia_tri', contractData.don_gia || 0);
            setValue('don_gia', '');
        } else {
            // Hợp đồng Hội viên: lưu vào cột don_gia
            setValue('don_gia', contractData.don_gia || 0);
            setValue('gia_tri', '');
        }
        
        // Cập nhật thông tin audit
        var now = new Date();
        setValue('nguoi_cap_nhat', Session.getActiveUser().getEmail());
        setValue('thoi_gian_cap_nhat', now);
        
        range.setValues([values]);
        
        
        // Tự động cập nhật điểm tích lũy cho khách hàng và PT
        try {
          if (typeof onContractChange === 'function') {
            onContractChange(contractData.ma_khach_hang, contractData.ma_hlv);
          }
        } catch (triggerError) {
        }
        
        return { success: true, message: 'Cập nhật hợp đồng thành công!' };
    } catch(e) {
        return { success: false, message: e.message };
    }
}

/**
 * Xóa mềm một hợp đồng.
 * @param {number} rowNumber Số dòng cần xóa.
 */
function deleteContract(rowNumber) {
    try {
        
        var CONTRACTS_SHEET = getContractsSheet();
        if (!CONTRACTS_SHEET) throw new Error("Sheet 'hop_dong' không tồn tại.");
        
        // Validate rowNumber
        if (!rowNumber || rowNumber < 2) {
            throw new Error('Số dòng không hợp lệ.');
        }
        
        var lastRow = CONTRACTS_SHEET.getLastRow();
        if (rowNumber > lastRow) {
            throw new Error('Hợp đồng không tồn tại.');
        }
        
        var headerMap = getHeaderMap(CONTRACTS_SHEET);
        var lastCol = CONTRACTS_SHEET.getLastColumn();
        var range = CONTRACTS_SHEET.getRange(rowNumber, 1, 1, lastCol);
        var values = range.getValues()[0];
        
        // Kiểm tra hợp đồng đã bị xóa chưa
        var isDeletedIndex = headerMap['IsDeleted'];
        if (isDeletedIndex !== undefined && values[isDeletedIndex] === 'YES') {
            throw new Error('Hợp đồng này đã bị xóa trước đó.');
        }
        
        // Cập nhật thông tin xóa
        var now = new Date();
        if (isDeletedIndex !== undefined) {
            values[isDeletedIndex] = 'YES';
        }
        
        // Lưu thông tin audit cho việc xóa
        var nguoiXoaIndex = headerMap['nguoi_xoa'];
        var thoiGianXoaIndex = headerMap['thoi_gian_xoa'];
        
        if (nguoiXoaIndex !== undefined) {
            values[nguoiXoaIndex] = Session.getActiveUser().getEmail();
        }
        if (thoiGianXoaIndex !== undefined) {
            values[thoiGianXoaIndex] = now;
        }
        
        range.setValues([values]);
        
        
        return { success: true, message: 'Xóa hợp đồng thành công!' };
    } catch (e) { 
        return { success: false, message: e.message }; 
    }
}


/**
 * Trả về HTML hợp đồng để in trực tiếp trên trình duyệt.
 * @param {Object} contractData Dữ liệu hợp đồng cần in.
 * @returns {Object} { success, html, message }
 */
function getContractPrintHtml(contractData) {
  try {
    // Get full contract details from sheet
    var CONTRACTS_SHEET = getContractsSheet();
    if (!CONTRACTS_SHEET) throw new Error("Sheet 'hop_dong' không tồn tại.");
    
    var fullContract = {};
    if (contractData.rowNumber) {
      var headerRow = CONTRACTS_SHEET.getRange(1, 1, 1, CONTRACTS_SHEET.getLastColumn()).getValues()[0];
      var dataRow = CONTRACTS_SHEET.getRange(contractData.rowNumber, 1, 1, CONTRACTS_SHEET.getLastColumn()).getValues()[0];
      for (var i = 0; i < headerRow.length; i++) {
        fullContract[headerRow[i]] = dataRow[i];
      }
    }

    // Prepare customer details from contract data (now stored in contract sheet)
    var customerDetails = {
      'Họ và Tên': fullContract['ten_khach_hang'] || contractData.customerName || '',
      'Số điện thoại': fullContract['so_dien_thoai'] || contractData.phoneNumber || '',
      'Email': fullContract['email'] || contractData.email || '',
      'CCCD': fullContract['cccd'] || contractData.cccd || '',
      'Địa chỉ': fullContract['dia_chi'] || contractData.address || '',
      'Ngày sinh': fullContract['ngay_sinh'] || contractData.dateOfBirth || '',
      'Giới tính': fullContract['gioi_tinh'] || contractData.gender || ''
    };

    // Chuẩn bị dữ liệu cho template
    var tpl = HtmlService.createTemplateFromFile('Contract_Print_Template');
    tpl.contract = contractData || {};
    tpl.customer = customerDetails;
    tpl.generatedDate = new Date().toLocaleDateString('vi-VN');

    var html = tpl.evaluate().getContent();
    return { success: true, html: html };
  } catch(e) {
    return { success: false, message: e.message };
  }
}

/**
 * Diagnostic helper: kiểm tra quyền truy cập folder export và khả năng tạo file.
 * Trả về object chứa thông tin hoặc lỗi để debug authorization/folder access.
 */
function checkDriveFolderAccess() {
  try {
    var folderId = CONTRACT_EXPORT_FOLDER_ID;
    if (!folderId) return { success: false, message: 'CONTRACT_EXPORT_FOLDER_ID chưa được cấu hình.' };
    var info = {};
    try {
      info.effectiveUser = Session.getEffectiveUser() ? Session.getEffectiveUser().getEmail() : 'unknown';
    } catch (e) { info.effectiveUser = 'n/a'; }
    try {
      info.activeUser = Session.getActiveUser ? (Session.getActiveUser().getEmail ? Session.getActiveUser().getEmail() : 'n/a') : 'n/a';
    } catch (e) { info.activeUser = 'n/a'; }

    var folder = DriveApp.getFolderById(folderId);
    info.folderId = folder.getId();
    info.folderName = folder.getName();
    // list editors/viewers (may be empty)
    info.editors = folder.getEditors().map(function(u){ try{return u.getEmail();}catch(e){return 'unknown';} });
    info.viewers = folder.getViewers().map(function(u){ try{return u.getEmail();}catch(e){return 'unknown';} });

    // Thử tạo file test và xóa ngay
    var blob = Utilities.newBlob('test','text/plain','drive_access_test.txt');
    var testFile = folder.createFile(blob);
    info.testFileId = testFile.getId();
    // trash immediately
    testFile.setTrashed(true);

    // Log để xem trong Executions/Logs khi chạy trực tiếp từ Editor
    return { success: true, info: info };
  } catch (e) {
    return { success: false, message: e.message, stack: e.stack ? e.stack.toString() : null };
  }
}

/**
 * In hợp đồng - Tạo HTML từ template và trả về
 * Lấy thông tin trực tiếp từ sheet Contract (không cần tra cứu sheet Members)
 * @param {string} contractId - ID hợp đồng
 * @returns {string} HTML content
 */
function printContract(contractId) {
  try {
    // Lấy thông tin chi tiết hợp đồng từ sheet
    var CONTRACTS_SHEET = getContractsSheet();
    if (!CONTRACTS_SHEET) {
      throw new Error("Sheet 'hop_dong' không tồn tại.");
    }
    
    // Tìm hợp đồng theo ID
    var lastRow = CONTRACTS_SHEET.getLastRow();
    if (lastRow <= 1) {
      throw new Error("Không có dữ liệu hợp đồng.");
    }
    
    var headerMap = getHeaderMap(CONTRACTS_SHEET);
    var lastCol = CONTRACTS_SHEET.getLastColumn();
    var rows = CONTRACTS_SHEET.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
    var contractRow = null;
    var contractRowNumber = -1;
    
    // Tìm row có ID trùng khớp
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][headerMap['Id']] === contractId) {
        contractRow = rows[i];
        contractRowNumber = i + 2; // +2 vì bắt đầu từ row 2 và index từ 0
        break;
      }
    }
    
    if (!contractRow) {
      throw new Error("Không tìm thấy hợp đồng với ID: " + contractId);
    }
    
    // Kiểm tra xem hợp đồng có bị xóa không
    var isDeletedIndex = headerMap['IsDeleted'];
    if (isDeletedIndex !== undefined && contractRow[isDeletedIndex] === 'YES') {
      throw new Error("Hợp đồng này đã bị xóa.");
    }
    
    // Chuẩn bị dữ liệu contract cho template
    var startDate = contractRow[headerMap['thoi_gian_bat_dau']];
    var endDate = contractRow[headerMap['thoi_gian_ket_thuc']];
    
    var contract = {
      id: contractRow[headerMap['Id']],
      customerId: contractRow[headerMap['ma_khach_hang']],
      customerName: contractRow[headerMap['ten_khach_hang']],
      ptId: contractRow[headerMap['ma_hlv']],
      ptName: contractRow[headerMap['ten_hlv']],
      packageName: contractRow[headerMap['ten_bang_gia']],
      packageCode: contractRow[headerMap['ma_bang_gia']],
      content: contractRow[headerMap['noi_dung']],
      duration: contractRow[headerMap['thoi_gian']],
      discount: contractRow[headerMap['chiet_khau']],
      benefit: contractRow[headerMap['uu_dai']],
      unitPrice: contractRow[headerMap['don_gia']],
      unit: contractRow[headerMap['don_vi_tinh']],
      quantity: contractRow[headerMap['so_luong']],
      vat: contractRow[headerMap['vat']],
      totalAmount: contractRow[headerMap['don_gia_vat']],
      finalAmount: contractRow[headerMap['tong_thanh_toan']],
      startDate: startDate ? new Date(startDate).toLocaleDateString('vi-VN') : '',
      endDate: endDate ? new Date(endDate).toLocaleDateString('vi-VN') : '',
      status: contractRow[headerMap['tinh_trang']],
      contractType: contractRow[headerMap['loai_hop_dong']],
      member: contractRow[headerMap['thanh_vien']]
    };
    
    // Lấy thông tin khách hàng/PT TRỰC TIẾP TỪ CONTRACT SHEET
    // Các thông tin này đã được lưu vào contract khi tạo/sửa hợp đồng
    var dateOfBirth = contractRow[headerMap['ngay_sinh']];
    
    var customer = {
      "Họ và Tên": contractRow[headerMap['ten_khach_hang']] || '',
      "Số điện thoại": contractRow[headerMap['so_dien_thoai']] || '',
      "Email": contractRow[headerMap['email']] || '',
      "CCCD": contractRow[headerMap['cccd']] || '',
      "Địa chỉ": contractRow[headerMap['dia_chi']] || '',
      "Ngày sinh": dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('vi-VN') : '',
      "Giới tính": contractRow[headerMap['gioi_tinh']] || ''
    };
    
    // Chọn template phù hợp dựa vào loại hợp đồng
    var contractType = contractRow[headerMap['loai_hop_dong']] || 'Hội viên';
    var templateName = (contractType === "PT" || contractType === "Personal Trainer") 
      ? "Contract_Print_PT_Template" 
      : "Contract_Print_Template";
    
    var template = HtmlService.createTemplateFromFile(templateName);
    
    // Gán dữ liệu vào template
    template.contract = contract;
    template.customer = customer;
    template.generatedDate = new Date().toLocaleDateString("vi-VN");
    
    var htmlOutput = template.evaluate();
    return htmlOutput.getContent();
    
  } catch (e) {
    throw new Error("Lỗi khi tạo hợp đồng in: " + e.message);
  }
}
