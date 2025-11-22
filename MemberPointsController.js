/**
 * Module tính điểm tích lũy cho Hội viên
 * Tính toán dựa trên tổng chi tiêu từ hợp đồng và quy đổi từ cấu hình
 */

/**
 * Đảm bảo sheet khach_hang có cột diem_tich_luy
 * Nếu chưa có, thêm vào cuối header
 */
function ensureMemberPointsColumns() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('khach_hang');
    if (!sheet) return false;
    
    var headerMap = getHeaderMap(sheet);
    var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var modified = false;
    
    // Kiểm tra và thêm cột diem_tich_luy nếu chưa có
    if (headerMap['diem_tich_luy'] === undefined) {
      var newCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, newCol).setValue('diem_tich_luy');
      modified = true;
    }
    
    // Kiểm tra và thêm cột hang_thanh_vien nếu chưa có
    if (headerMap['hang_thanh_vien'] === undefined) {
      var newCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, newCol).setValue('hang_thanh_vien');
      modified = true;
    }
    
    return modified;
  } catch (e) {
    return false;
  }
}

/**
 * Lấy giá trị quy đổi cho Hội viên từ bảng cau_hinh
 * @returns {number} Giá trị quy đổi (VD: 1 điểm = 1,000,000 VNĐ)
 */
function getMemberPointConversionRate() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('cau_hinh');
    if (!sheet) return 1000000; // Default: 1 điểm = 1,000,000 VNĐ
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return 1000000;
    
    var headerMap = getHeaderMap(sheet);
    var rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    // Tìm dòng cấu hình quy đổi cho đối tượng Hội viên (chấp nhận cả tiếng Việt và English)
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var doiTuongRaw = headerMap['doi_tuong'] !== undefined ? row[headerMap['doi_tuong']] : '';
      var loaiHinhRaw = headerMap['loai_hinh'] !== undefined ? row[headerMap['loai_hinh']] : '';
      var giaTriRaw = headerMap['gia_tri'] !== undefined ? row[headerMap['gia_tri']] : '';
      var soLuongRaw = headerMap['so_luong'] !== undefined ? row[headerMap['so_luong']] : '';
      var quyDoiRaw = headerMap['quy_doi'] !== undefined ? row[headerMap['quy_doi']] : '';
      var isDeleted = headerMap['IsDeleted'] !== undefined ? row[headerMap['IsDeleted']] : '';

      if (isDeleted === 'YES') continue;

      var doiTuong = String(doiTuongRaw || '').toLowerCase();
      var loaiHinh = String(loaiHinhRaw || '').toLowerCase();

      // Kiểm tra xem dòng này có dành cho Hội viên (hoặc có từ 'member')
      var isMemberTarget = doiTuong.indexOf('hội') !== -1 || doiTuong.indexOf('hoi') !== -1 || doiTuong.indexOf('member') !== -1;
      if (!isMemberTarget) {
        // Có trường hợp nhãn ghi 'Member ship' -> vẫn phải chấp nhận
        if (loaiHinh.indexOf('member') !== -1 || loaiHinh.indexOf('membership') !== -1) {
          isMemberTarget = true;
        }
      }

      if (!isMemberTarget) continue;

      // Ưu tiên lấy giá trị từ cột 'quy_doi' nếu có
      var candidate = quyDoiRaw || giaTriRaw || soLuongRaw;
      if (candidate) {
        var match = String(candidate).match(/(\d+)/g);
        if (match && match.length > 0) {
          // Lấy chuỗi số dài nhất (trường hợp có nhiều số trong chuỗi)
          var longest = match.reduce(function(a, b) { return a.length >= b.length ? a : b; });
          var value = parseInt(longest, 10);
          if (!isNaN(value) && value > 0) {
            return value;
          }
        }
      }

      // Nếu không có số rõ ràng nhưng loaiHinh chứa 'stamp' hoặc 'tỷ' có thể dùng so_luong/gia_tri kết hợp
      if (loaiHinh.indexOf('stamp') !== -1 || loaiHinh.indexOf('tỷ') !== -1 || loaiHinh.indexOf('quy') !== -1) {
        if (soLuongRaw && giaTriRaw) {
          var s = parseFloat(soLuongRaw);
          var g = parseFloat(giaTriRaw);
          if (!isNaN(s) && !isNaN(g) && s > 0) {
            var computed = Math.floor(g / s);
            if (computed > 0) {
              return computed;
            }
          }
        }
      }
    }

    return 1000000; // Default: 1 điểm = 1,000,000 VNĐ
  } catch (e) {
    return 1000000;
  }
}

/**
 * Tính tổng chi tiêu của khách hàng từ tất cả hợp đồng
 * @param {string} customerId Mã khách hàng
 * @returns {number} Tổng chi tiêu
 */
function calculateTotalSpending(customerId) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('hop_dong');
    if (!sheet) return 0;
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return 0;
    
    var headerMap = getHeaderMap(sheet);
    var rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    var total = 0;
    for (var i = 0; i < rows.length; i++) {
      var maKhachHang = rows[i][headerMap['ma_khach_hang']];
      var isDeleted = headerMap['IsDeleted'] !== undefined ? rows[i][headerMap['IsDeleted']] : '';
      
      if (isDeleted === 'YES') continue;
      
      if (maKhachHang === customerId) {
        var tongThanhToan = rows[i][headerMap['tong_thanh_toan']];
        if (tongThanhToan && !isNaN(tongThanhToan)) {
          total += parseFloat(tongThanhToan);
        }
      }
    }
    
    return total;
  } catch (e) {
    return 0;
  }
}

/**
 * Tính điểm tích lũy của khách hàng (làm tròn xuống)
 * @param {string} customerId Mã khách hàng
 * @returns {number} Số điểm tích lũy
 */
function calculateMemberPoints(customerId) {
  try {
    var totalSpending = calculateTotalSpending(customerId);
    var conversionRate = getMemberPointConversionRate();
    
    // Tính điểm và làm tròn xuống
    var points = Math.floor(totalSpending / conversionRate);
    
    return points;
  } catch (e) {
    return 0;
  }
}

/**
 * Xác định hạng thành viên dựa trên điểm tích lũy
 * @param {number} points Số điểm tích lũy
 * @returns {string} Hạng thành viên
 */
function getMemberRank(points) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('chinh_sach_hoi_vien');
    if (!sheet) return 'Đồng';
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return 'Đồng';
    
    var headerMap = getHeaderMap(sheet);
    var rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    // Tạo danh sách các hạng và điểm yêu cầu
    var ranks = [];
    for (var i = 0; i < rows.length; i++) {
      var isDeleted = headerMap['IsDeleted'] !== undefined ? rows[i][headerMap['IsDeleted']] : '';
      if (isDeleted === 'YES') continue;
      
      var hang = rows[i][headerMap['hang_thanh_vien']];
      var diem = rows[i][headerMap['diem_tich_luy']];
      
      if (hang && diem !== undefined && diem !== null && diem !== '') {
        ranks.push({
          hang: hang,
          diem: parseFloat(diem)
        });
      }
    }
    
    // Sắp xếp theo điểm giảm dần (từ cao xuống thấp)
    ranks.sort(function(a, b) { return b.diem - a.diem; });
    
    if (ranks.length === 0) return 'Đồng';
    
    // Tìm hạng cao nhất mà khách hàng đủ điều kiện
    // Duyệt từ hạng cao nhất xuống, tìm hạng đầu tiên có điểm yêu cầu <= điểm khách hàng
    for (var i = 0; i < ranks.length; i++) {
      if (points >= ranks[i].diem) {
        return ranks[i].hang;
      }
    }
    
    // Nếu không đủ điều kiện hạng nào, trả về hạng thấp nhất
    return ranks[ranks.length - 1].hang;
    
  } catch (e) {
    return 'Đồng';
  }
}

/**
 * Lấy thông tin tích điểm đầy đủ của khách hàng
 * @param {string} customerId Mã khách hàng
 * @returns {Object} Thông tin tích điểm
 */
function getMemberPointsInfo(customerId) {
  try {
    var totalSpending = calculateTotalSpending(customerId);
    var conversionRate = getMemberPointConversionRate();
    var points = calculateMemberPoints(customerId);
    var rank = getMemberRank(points);
    
    return {
      success: true,
      customerId: customerId,
      totalSpending: totalSpending,
      conversionRate: conversionRate,
      points: points,
      rank: rank
    };
  } catch (e) {
    return {
      success: false,
      message: e.message
    };
  }
}

/**
 * Cập nhật điểm tích lũy và hạng cho tất cả khách hàng
 * (Hàm này có thể được gọi định kỳ hoặc sau mỗi giao dịch)
 */
function updateAllMemberPoints() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('khach_hang');
    if (!sheet) {
      return { success: false, message: 'Sheet khach_hang không tồn tại' };
    }
    
    // Đảm bảo các cột cần thiết tồn tại
    var columnsAdded = ensureMemberPointsColumns();
    
    // Phải flush changes để Google Sheets cập nhật
    if (columnsAdded) {
      SpreadsheetApp.flush();
    }
    
    var members = getMembers();
    if (!members || members.error) {
      return { success: false, message: 'Không thể lấy danh sách khách hàng' };
    }
    
    // Refresh headerMap sau khi đã thêm cột mới và flush
    var headerMap = getHeaderMap(sheet);
    var updated = 0;
    
    
    for (var i = 0; i < members.length; i++) {
      var member = members[i];
      var pointsInfo = getMemberPointsInfo(member.id);
      
      if (pointsInfo.success) {
        // Cập nhật điểm và hạng vào sheet
        var rowNumber = member.rowNumber;
        
        
        // Kiểm tra xem có cột diem_tich_luy và hang_thanh_vien không
        if (headerMap['diem_tich_luy'] !== undefined) {
          var colNum = headerMap['diem_tich_luy'] + 1;
          sheet.getRange(rowNumber, colNum).setValue(pointsInfo.points);
        } else {
        }
        
        if (headerMap['hang_thanh_vien'] !== undefined) {
          var colNum = headerMap['hang_thanh_vien'] + 1;
          sheet.getRange(rowNumber, colNum).setValue(pointsInfo.rank);
        } else {
        }
        
        updated++;
      }
    }
    
    return { 
      success: true, 
      message: 'Đã cập nhật điểm cho ' + updated + ' khách hàng'
    };
  } catch (e) {
    return {
      success: false,
      message: e.message
    };
  }
}

/**
 * Cập nhật điểm cho một khách hàng cụ thể
 * @param {string} customerId Mã khách hàng
 * @param {number} rowNumber Số dòng của khách hàng trong sheet
 */
function updateSingleMemberPoints(customerId, rowNumber) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('khach_hang');
    if (!sheet) {
      return { success: false, message: 'Sheet khach_hang không tồn tại' };
    }
    
    // Đảm bảo các cột cần thiết tồn tại
    var columnsAdded = ensureMemberPointsColumns();
    
    // Phải flush changes để Google Sheets cập nhật
    if (columnsAdded) {
      SpreadsheetApp.flush();
    }
    
    var pointsInfo = getMemberPointsInfo(customerId);
    
    if (!pointsInfo.success) {
      return pointsInfo;
    }
    
    // Refresh headerMap sau khi đã thêm cột mới và flush
    var headerMap = getHeaderMap(sheet);
    
    
    // Cập nhật điểm và hạng vào sheet
    if (headerMap['diem_tich_luy'] !== undefined) {
      var colNum = headerMap['diem_tich_luy'] + 1;
      sheet.getRange(rowNumber, colNum).setValue(pointsInfo.points);
    } else {
    }
    
    if (headerMap['hang_thanh_vien'] !== undefined) {
      var colNum = headerMap['hang_thanh_vien'] + 1;
      sheet.getRange(rowNumber, colNum).setValue(pointsInfo.rank);
    } else {
    }
    
    return { 
      success: true, 
      message: 'Đã cập nhật điểm tích lũy',
      points: pointsInfo.points,
      rank: pointsInfo.rank,
      totalSpending: pointsInfo.totalSpending
    };
  } catch (e) {
    return {
      success: false,
      message: e.message
    };
  }
}

// ==================== PT POINTS FUNCTIONS ====================

/**
 * Đảm bảo sheet PT có cột diem_tich_luy và hang_thanh_vien
 */
function ensurePTPointsColumns() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('PT');
    if (!sheet) return false;
    
    var headerMap = getHeaderMap(sheet);
    var modified = false;
    
    if (headerMap['diem_tich_luy'] === undefined) {
      var newCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, newCol).setValue('diem_tich_luy');
      modified = true;
    }
    
    if (headerMap['hang_thanh_vien'] === undefined) {
      var newCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, newCol).setValue('hang_thanh_vien');
      modified = true;
    }
    
    return modified;
  } catch (e) {
    return false;
  }
}

/**
 * Lấy tỷ lệ quy đổi điểm cho PT từ bảng cau_hinh
 */
function getPTPointConversionRate() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('cau_hinh');
    if (!sheet) return 1000000;
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return 1000000;
    
    var headerMap = getHeaderMap(sheet);
    var rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var doiTuongRaw = headerMap['doi_tuong'] !== undefined ? row[headerMap['doi_tuong']] : '';
      var loaiHinhRaw = headerMap['loai_hinh'] !== undefined ? row[headerMap['loai_hinh']] : '';
      var quyDoiRaw = headerMap['quy_doi'] !== undefined ? row[headerMap['quy_doi']] : '';
      var isDeleted = headerMap['IsDeleted'] !== undefined ? row[headerMap['IsDeleted']] : '';

      if (isDeleted === 'YES') continue;

      var doiTuong = String(doiTuongRaw || '').toLowerCase().trim();
      
      // Tìm config cho PT - chấp nhận "PT", "HLV", "Trainer" hoặc các biến thể
      var isPTTarget = doiTuong.indexOf('pt') !== -1 || 
                       doiTuong.indexOf('hlv') !== -1 || 
                       doiTuong.indexOf('trainer') !== -1 ||
                       doiTuong === 'pt' ||
                       doiTuong === 'hlv';
      
      if (!isPTTarget) continue;

      var candidate = quyDoiRaw;
      if (candidate) {
        var match = String(candidate).match(/(\d+)/g);
        if (match && match.length > 0) {
          var longest = match.reduce(function(a, b) { return a.length >= b.length ? a : b; });
          var value = parseInt(longest, 10);
          if (!isNaN(value) && value > 0) {
            return value;
          }
        }
      }
    }

    return 1000000; // Default
  } catch (e) {
    return 1000000;
  }
}

/**
 * Tính tổng doanh thu của PT từ hợp đồng
 */
function calculatePTTotalRevenue(ptId) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var contractSheet = ss.getSheetByName('hop_dong');
    if (!contractSheet) return 0;
    
    var lastRow = contractSheet.getLastRow();
    if (lastRow <= 1) return 0;
    
    var headerMap = getHeaderMap(contractSheet);
    var rows = contractSheet.getRange(2, 1, lastRow - 1, contractSheet.getLastColumn()).getValues();
    
    var total = 0;

    // Bước chuẩn bị: lấy danh sách memberIds (Id) của các hội viên được gán cho PT này
    var memberIds = [];
    try {
      var memberSheet = ss.getSheetByName('khach_hang');
      if (memberSheet) {
        var memberLastRow = memberSheet.getLastRow();
        if (memberLastRow > 1) {
          var memberHeaderMap = getHeaderMap(memberSheet);
          var memberRows = memberSheet.getRange(2, 1, memberLastRow - 1, memberSheet.getLastColumn()).getValues();
          for (var m = 0; m < memberRows.length; m++) {
            var memberIsDeleted = memberHeaderMap['IsDeleted'] !== undefined ? memberRows[m][memberHeaderMap['IsDeleted']] : '';
            if (memberIsDeleted === 'YES') continue;

            var memberPTId = memberHeaderMap['ma_hlv'] !== undefined ? memberRows[m][memberHeaderMap['ma_hlv']] : '';
            var memberId = memberHeaderMap['Id'] !== undefined ? memberRows[m][memberHeaderMap['Id']] : '';

            if (memberPTId !== undefined && memberPTId !== '' && String(memberPTId).trim() === String(ptId).trim()) {
              if (memberId !== undefined && memberId !== '') {
                memberIds.push(String(memberId).trim());
              }
            }
          }
        }
      }
    } catch (memberErr) {
      // ignore member loading errors, proceed with what we have
    }

    // Duyệt một lần qua tất cả hợp đồng và cộng dồn một cách an toàn, tránh double-counting
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var isDeleted = headerMap['IsDeleted'] !== undefined ? row[headerMap['IsDeleted']] : '';
      if (isDeleted === 'YES') continue;

      var maHLV = headerMap['ma_hlv'] !== undefined ? row[headerMap['ma_hlv']] : '';
      var maKhachHang = headerMap['ma_khach_hang'] !== undefined ? row[headerMap['ma_khach_hang']] : '';
      var loaiHopDong = headerMap['loai_hop_dong'] !== undefined ? row[headerMap['loai_hop_dong']] : '';
      var tongThanhToan = headerMap['tong_thanh_toan'] !== undefined ? row[headerMap['tong_thanh_toan']] : 0;

      // Normalize to string for comparisons
      var maHLV_s = maHLV !== undefined && maHLV !== null ? String(maHLV).trim() : '';
      var maKhachHang_s = maKhachHang !== undefined && maKhachHang !== null ? String(maKhachHang).trim() : '';
      var loaiHopDong_s = loaiHopDong !== undefined && loaiHopDong !== null ? String(loaiHopDong).trim() : '';

      var added = false;

      // 1) Nếu hợp đồng có ma_hlv = ptId (PT là HLV của hợp đồng này)
      if (maHLV_s !== '' && maHLV_s === String(ptId).trim()) {
        added = true;
      }

      // 2) Nếu hợp đồng là loại PT và ma_khach_hang = ptId (PT ký hợp đồng trực tiếp)
      if (!added && maKhachHang_s !== '' && maKhachHang_s === String(ptId).trim() && loaiHopDong_s === 'PT') {
        added = true;
      }

      // 3) Nếu hợp đồng thuộc về một hội viên mà hội viên đó được gán cho PT này
      if (!added && maKhachHang_s !== '' && memberIds.length > 0) {
        for (var mi = 0; mi < memberIds.length; mi++) {
          if (maKhachHang_s === memberIds[mi]) {
            added = true;
            break;
          }
        }
      }

      if (added) {
        if (tongThanhToan && !isNaN(tongThanhToan)) {
          total += parseFloat(tongThanhToan);
        }
      }
    }

    return total;
  } catch (e) {
    return 0;
  }
}

/**
 * Tính điểm tích lũy của PT
 */
function calculatePTPoints(ptId) {
  try {
    var totalRevenue = calculatePTTotalRevenue(ptId);
    var conversionRate = getPTPointConversionRate();
    var points = Math.floor(totalRevenue / conversionRate);
    return points;
  } catch (e) {
    return 0;
  }
}

/**
 * Xác định hạng của PT dựa trên điểm
 */
function getPTRank(points) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('chinh_sach_PT');
    if (!sheet) return 'Đồng';
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return 'Đồng';
    
    var headerMap = getHeaderMap(sheet);
    var rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    var ranks = [];
    for (var i = 0; i < rows.length; i++) {
      var isDeleted = headerMap['IsDeleted'] !== undefined ? rows[i][headerMap['IsDeleted']] : '';
      if (isDeleted === 'YES') continue;
      
      var hang = rows[i][headerMap['hang_thanh_vien']];
      var diem = rows[i][headerMap['diem_tich_luy']];
      
      if (hang && diem !== undefined && diem !== null && diem !== '') {
        ranks.push({
          hang: hang,
          diem: parseFloat(diem)
        });
      }
    }
    
    // Sắp xếp theo điểm giảm dần (từ cao xuống thấp)
    ranks.sort(function(a, b) { return b.diem - a.diem; });
    
    if (ranks.length === 0) return 'Đồng';
    
    // Tìm hạng cao nhất mà PT đủ điều kiện
    // Duyệt từ hạng cao nhất xuống, tìm hạng đầu tiên có điểm yêu cầu <= điểm PT
    for (var i = 0; i < ranks.length; i++) {
      if (points >= ranks[i].diem) {
        return ranks[i].hang;
      }
    }
    
    // Nếu không đủ điều kiện hạng nào, trả về hạng thấp nhất
    return ranks[ranks.length - 1].hang;
  } catch (e) {
    return 'Đồng';
  }
}

/**
 * Lấy thông tin điểm đầy đủ của PT
 */
function getPTPointsInfo(ptId) {
  try {
    var totalRevenue = calculatePTTotalRevenue(ptId);
    var conversionRate = getPTPointConversionRate();
    var points = calculatePTPoints(ptId);
    var rank = getPTRank(points);
    
    return {
      success: true,
      ptId: ptId,
      totalRevenue: totalRevenue,
      conversionRate: conversionRate,
      points: points,
      rank: rank
    };
  } catch (e) {
    return {
      success: false,
      message: e.message
    };
  }
}

/**
 * Cập nhật điểm cho tất cả PT
 */
function updateAllPTPoints() {
  try {
    ensurePTPointsColumns();
    
    var pts = getPTs();
    if (!pts || pts.error) {
      return { success: false, message: 'Không thể lấy danh sách PT' };
    }
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('PT');
    if (!sheet) {
      return { success: false, message: 'Sheet PT không tồn tại' };
    }
    
    if (ensurePTPointsColumns()) {
      SpreadsheetApp.flush();
    }
    
    var headerMap = getHeaderMap(sheet);
    var updated = 0;
    
    for (var i = 0; i < pts.length; i++) {
      var pt = pts[i];
      var pointsInfo = getPTPointsInfo(pt.id);
      
      if (pointsInfo.success) {
        var rowNumber = pt.rowNumber;
        
        if (headerMap['diem_tich_luy'] !== undefined) {
          var colNum = headerMap['diem_tich_luy'] + 1;
          sheet.getRange(rowNumber, colNum).setValue(pointsInfo.points);
        }
        
        if (headerMap['hang_thanh_vien'] !== undefined) {
          var colNum = headerMap['hang_thanh_vien'] + 1;
          sheet.getRange(rowNumber, colNum).setValue(pointsInfo.rank);
        }
        
        updated++;
      }
    }
    
    return { 
      success: true, 
      message: 'Đã cập nhật điểm cho ' + updated + ' PT'
    };
  } catch (e) {
    return {
      success: false,
      message: e.message
    };
  }
}

/**
 * Cập nhật điểm cho một PT cụ thể
 */
function updateSinglePTPoints(ptId, rowNumber) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('PT');
    if (!sheet) {
      return { success: false, message: 'Sheet PT không tồn tại' };
    }
    
    ensurePTPointsColumns();
    
    if (ensurePTPointsColumns()) {
      SpreadsheetApp.flush();
    }
    
    var pointsInfo = getPTPointsInfo(ptId);
    
    if (!pointsInfo.success) {
      return pointsInfo;
    }
    
    var headerMap = getHeaderMap(sheet);
    
    if (headerMap['diem_tich_luy'] !== undefined) {
      var colNum = headerMap['diem_tich_luy'] + 1;
      sheet.getRange(rowNumber, colNum).setValue(pointsInfo.points);
    }
    
    if (headerMap['hang_thanh_vien'] !== undefined) {
      var colNum = headerMap['hang_thanh_vien'] + 1;
      sheet.getRange(rowNumber, colNum).setValue(pointsInfo.rank);
    }
    
    return { 
      success: true, 
      message: 'Đã cập nhật điểm PT',
      points: pointsInfo.points,
      rank: pointsInfo.rank,
      totalRevenue: pointsInfo.totalRevenue
    };
  } catch (e) {
    return {
      success: false,
      message: e.message
    };
  }
}
