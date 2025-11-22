/**
 * Module quản lý Triggers
 * Tự động thực thi các hành động khi có thay đổi dữ liệu
 */

/**
 * Hàm này sẽ được gọi sau khi thêm hoặc cập nhật hợp đồng
 * Tự động cập nhật điểm tích lũy cho khách hàng và PT
 * @param {string} customerId Mã khách hàng
 * @param {string} ptId Mã PT (optional)
 */
function onContractChange(customerId, ptId) {
  try {
    // Cập nhật điểm cho khách hàng
    if (customerId) {
      var members = getMembers();
      if (members && !members.error) {
        var member = null;
        for (var i = 0; i < members.length; i++) {
          if (members[i].id === customerId) {
            member = members[i];
            break;
          }
        }
        
        if (member) {
          var result = updateSingleMemberPoints(customerId, member.rowNumber);
          if (result.success) {
          }
        }
      }
    }
    
    // Cập nhật điểm cho PT
    if (ptId) {
      var pts = getPTs();
      if (pts && !pts.error) {
        var pt = null;
        for (var i = 0; i < pts.length; i++) {
          if (pts[i].id === ptId) {
            pt = pts[i];
            break;
          }
        }
        
        if (pt) {
          var result = updateSinglePTPoints(ptId, pt.rowNumber);
          if (result.success) {
          }
        }
      }
    }
    
  } catch (e) {
  }
}

/**
 * Cài đặt trigger tự động (chỉ cần chạy 1 lần)
 * Hàm này tạo các trigger để theo dõi thay đổi trong spreadsheet
 */
function setupTriggers() {
  try {
    // Xóa tất cả triggers cũ trước
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
    
    
    // Tạo trigger mới: Theo dõi khi sheet thay đổi
    // Note: Trigger onChange sẽ chạy khi có bất kỳ thay đổi nào trong spreadsheet
    // Chúng ta sẽ kiểm tra xem có phải là sheet hop_dong không
    ScriptApp.newTrigger('onSpreadsheetChange')
      .forSpreadsheet(SPREADSHEET_ID)
      .onChange()
      .create();
    
    
    return { success: true, message: 'Đã cài đặt triggers thành công' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Hàm được trigger gọi khi có thay đổi trong spreadsheet
 * @param {Object} e Event object
 */
function onSpreadsheetChange(e) {
  try {
    // Log để debug
    
    // Note: onChange trigger không cung cấp thông tin chi tiết về sheet nào thay đổi
    // Chúng ta sẽ cập nhật tất cả điểm để đảm bảo đồng bộ
    // Tuy nhiên để tránh quá tải, chúng ta có thể thêm logic cache hoặc throttle
    
    // Cách đơn giản: cập nhật tất cả (có thể chậm nếu nhiều khách hàng)
    // updateAllMemberPoints();
    
    // Cách tối ưu hơn: Chỉ cập nhật khi cần
    // Vì không biết sheet nào thay đổi, ta có thể đặt flag và cập nhật sau
    
  } catch (e) {
  }
}

/**
 * Xóa tất cả triggers
 */
function removeTriggers() {
  try {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
    
    return { success: true, message: 'Đã xóa tất cả triggers' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Kiểm tra trạng thái triggers hiện tại
 */
function checkTriggers() {
  try {
    var triggers = ScriptApp.getProjectTriggers();
    var info = [];
    
    for (var i = 0; i < triggers.length; i++) {
      var trigger = triggers[i];
      info.push({
        handlerFunction: trigger.getHandlerFunction(),
        eventType: trigger.getEventType().toString(),
        triggerSource: trigger.getTriggerSource().toString()
      });
    }
    
    return {
      success: true,
      count: triggers.length,
      triggers: info
    };
  } catch (e) {
    return {
      success: false,
      message: e.message
    };
  }
}
