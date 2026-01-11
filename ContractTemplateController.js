/**
 * Contract Template Controller
 * Quản lý các mẫu hợp đồng (Member & PT)
 */

// Tên sheet lưu trữ mẫu hợp đồng
var TEMPLATE_SHEET_NAME = 'mau_hop_dong';

/**
 * Lấy danh sách tất cả mẫu hợp đồng
 */
function getContractTemplates() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(TEMPLATE_SHEET_NAME);

    if (!sheet) {
      Logger.log('Sheet mau_hop_dong không tồn tại');
      return [];
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return [];
    }

    var headerMap = getHeaderMap(sheet);
    var dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
    var data = dataRange.getValues();

    var templates = [];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];

      // Bỏ qua các bản ghi đã xóa
      if (row[headerMap['IsDeleted']] === 'YES') {
        continue;
      }

      templates.push({
        rowNumber: i + 2,
        id: row[headerMap['Id']],
        ten_mau: row[headerMap['Tên mẫu']],
        loai_mau: row[headerMap['Loại mẫu']], // "Hội viên" hoặc "PT"
        mo_ta: row[headerMap['Mô tả']],
        noi_dung_html: row[headerMap['Nội dung HTML']],
        trang_thai: row[headerMap['Trạng thái']], // "Đang sử dụng" hoặc "Không sử dụng"
        ngay_tao: row[headerMap['Ngày tạo']],
        thoi_gian_tao: row[headerMap['Thời gian tạo']],
        nguoi_tao: row[headerMap['Người tạo']],
        ngay_cap_nhat: row[headerMap['Ngày cập nhật']],
        thoi_gian_cap_nhat: row[headerMap['Thời gian cập nhật']],
        nguoi_cap_nhat: row[headerMap['Người cập nhật']]
      });
    }

    return templates;
  } catch (error) {
    Logger.log('Error in getContractTemplates: ' + error.toString());
    throw error;
  }
}

/**
 * Lấy mẫu hợp đồng theo loại và trạng thái đang sử dụng
 */
function getActiveTemplateByType(loaiMau) {
  try {
    var allTemplates = getContractTemplates();

    for (var i = 0; i < allTemplates.length; i++) {
      if (allTemplates[i].loai_mau === loaiMau &&
          allTemplates[i].trang_thai === 'Đang sử dụng') {
        return allTemplates[i];
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error in getActiveTemplateByType: ' + error.toString());
    throw error;
  }
}

/**
 * Lấy chi tiết mẫu hợp đồng theo row number
 */
function getContractTemplateByRow(rowNumber) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(TEMPLATE_SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet mau_hop_dong không tồn tại');
    }

    var headerMap = getHeaderMap(sheet);
    var row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];

    return {
      rowNumber: rowNumber,
      id: row[headerMap['Id']],
      ten_mau: row[headerMap['Tên mẫu']],
      loai_mau: row[headerMap['Loại mẫu']],
      mo_ta: row[headerMap['Mô tả']],
      noi_dung_html: row[headerMap['Nội dung HTML']],
      trang_thai: row[headerMap['Trạng thái']],
      ngay_tao: row[headerMap['Ngày tạo']],
      thoi_gian_tao: row[headerMap['Thời gian tạo']],
      nguoi_tao: row[headerMap['Người tạo']],
      ngay_cap_nhat: row[headerMap['Ngày cập nhật']],
      thoi_gian_cap_nhat: row[headerMap['Thời gian cập nhật']],
      nguoi_cap_nhat: row[headerMap['Người cập nhật']]
    };
  } catch (error) {
    Logger.log('Error in getContractTemplateByRow: ' + error.toString());
    throw error;
  }
}

/**
 * Thêm mẫu hợp đồng mới
 */
function addContractTemplate(templateData) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(TEMPLATE_SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet mau_hop_dong không tồn tại');
    }

    var headerMap = getHeaderMap(sheet);
    var now = new Date();
    var userEmail = Session.getActiveUser().getEmail();

    // Tạo ID mới
    var templateId = 'TPL-' + now.getTime();

    // Format ngày
    var formattedDate = Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
    var formattedTime = Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');

    // Tạo row mới
    var newRow = new Array(sheet.getLastColumn()).fill('');
    newRow[headerMap['Id']] = templateId;
    newRow[headerMap['Tên mẫu']] = templateData.ten_mau || '';
    newRow[headerMap['Loại mẫu']] = templateData.loai_mau || '';
    newRow[headerMap['Mô tả']] = templateData.mo_ta || '';
    newRow[headerMap['Nội dung HTML']] = templateData.noi_dung_html || '';
    newRow[headerMap['Trạng thái']] = templateData.trang_thai || 'Không sử dụng';
    newRow[headerMap['Ngày tạo']] = formattedDate;
    newRow[headerMap['Thời gian tạo']] = formattedTime;
    newRow[headerMap['Người tạo']] = userEmail;
    newRow[headerMap['IsDeleted']] = 'NO';

    // Nếu template mới được đặt "Đang sử dụng", vô hiệu hóa template cũ cùng loại
    if (templateData.trang_thai === 'Đang sử dụng') {
      deactivateOtherTemplates(sheet, templateData.loai_mau, headerMap);
    }

    sheet.appendRow(newRow);

    return {
      success: true,
      message: 'Thêm mẫu hợp đồng thành công',
      templateId: templateId
    };
  } catch (error) {
    Logger.log('Error in addContractTemplate: ' + error.toString());
    throw error;
  }
}

/**
 * Cập nhật mẫu hợp đồng
 */
function updateContractTemplate(templateData) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(TEMPLATE_SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet mau_hop_dong không tồn tại');
    }

    var headerMap = getHeaderMap(sheet);
    var rowNumber = templateData.rowNumber;
    var now = new Date();
    var userEmail = Session.getActiveUser().getEmail();

    // Format ngày
    var formattedDate = Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
    var formattedTime = Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');

    // Nếu template được đặt "Đang sử dụng", vô hiệu hóa template cũ cùng loại
    if (templateData.trang_thai === 'Đang sử dụng') {
      deactivateOtherTemplates(sheet, templateData.loai_mau, headerMap, rowNumber);
    }

    // Cập nhật các trường
    sheet.getRange(rowNumber, headerMap['Tên mẫu'] + 1).setValue(templateData.ten_mau || '');
    sheet.getRange(rowNumber, headerMap['Loại mẫu'] + 1).setValue(templateData.loai_mau || '');
    sheet.getRange(rowNumber, headerMap['Mô tả'] + 1).setValue(templateData.mo_ta || '');
    sheet.getRange(rowNumber, headerMap['Nội dung HTML'] + 1).setValue(templateData.noi_dung_html || '');
    sheet.getRange(rowNumber, headerMap['Trạng thái'] + 1).setValue(templateData.trang_thai || 'Không sử dụng');
    sheet.getRange(rowNumber, headerMap['Ngày cập nhật'] + 1).setValue(formattedDate);
    sheet.getRange(rowNumber, headerMap['Thời gian cập nhật'] + 1).setValue(formattedTime);
    sheet.getRange(rowNumber, headerMap['Người cập nhật'] + 1).setValue(userEmail);

    return {
      success: true,
      message: 'Cập nhật mẫu hợp đồng thành công'
    };
  } catch (error) {
    Logger.log('Error in updateContractTemplate: ' + error.toString());
    throw error;
  }
}

/**
 * Xóa mẫu hợp đồng (soft delete)
 */
function deleteContractTemplate(rowNumber) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(TEMPLATE_SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet mau_hop_dong không tồn tại');
    }

    var headerMap = getHeaderMap(sheet);
    sheet.getRange(rowNumber, headerMap['IsDeleted'] + 1).setValue('YES');

    return {
      success: true,
      message: 'Xóa mẫu hợp đồng thành công'
    };
  } catch (error) {
    Logger.log('Error in deleteContractTemplate: ' + error.toString());
    throw error;
  }
}

/**
 * Vô hiệu hóa các template khác cùng loại khi kích hoạt template mới
 */
function deactivateOtherTemplates(sheet, loaiMau, headerMap, excludeRowNumber) {
  try {
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return;
    }

    var dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
    var data = dataRange.getValues();

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var currentRowNumber = i + 2;

      // Bỏ qua row hiện tại đang được cập nhật
      if (excludeRowNumber && currentRowNumber === excludeRowNumber) {
        continue;
      }

      // Bỏ qua các bản ghi đã xóa
      if (row[headerMap['IsDeleted']] === 'YES') {
        continue;
      }

      // Nếu cùng loại và đang sử dụng, vô hiệu hóa
      if (row[headerMap['Loại mẫu']] === loaiMau &&
          row[headerMap['Trạng thái']] === 'Đang sử dụng') {
        sheet.getRange(currentRowNumber, headerMap['Trạng thái'] + 1).setValue('Không sử dụng');
      }
    }
  } catch (error) {
    Logger.log('Error in deactivateOtherTemplates: ' + error.toString());
    throw error;
  }
}

/**
 * Sao chép template hiện tại (Member & PT) vào database
 * Function này chỉ chạy 1 lần để migrate template hiện tại
 */
function migrateExistingTemplatesToDB() {
  try {
    var memberTemplateHTML = HtmlService.createHtmlOutputFromFile('Contract_Print_Template').getContent();
    var ptTemplateHTML = HtmlService.createHtmlOutputFromFile('Contract_Print_PT_Template').getContent();

    // Thêm template Member
    addContractTemplate({
      ten_mau: 'Mẫu hợp đồng thành viên mặc định',
      loai_mau: 'Hội viên',
      mo_ta: 'Mẫu hợp đồng thành viên tiêu chuẩn - được migrate từ file Contract_Print_Template.html',
      noi_dung_html: memberTemplateHTML,
      trang_thai: 'Đang sử dụng'
    });

    // Thêm template PT
    addContractTemplate({
      ten_mau: 'Mẫu hợp đồng PT mặc định',
      loai_mau: 'PT',
      mo_ta: 'Mẫu hợp đồng PT tiêu chuẩn - được migrate từ file Contract_Print_PT_Template.html',
      noi_dung_html: ptTemplateHTML,
      trang_thai: 'Đang sử dụng'
    });

    Logger.log('Migration completed successfully');
    return { success: true, message: 'Đã migrate 2 template thành công' };
  } catch (error) {
    Logger.log('Error in migrateExistingTemplatesToDB: ' + error.toString());
    throw error;
  }
}
