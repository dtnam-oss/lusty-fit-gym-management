/**
 * Lấy dữ liệu tối thiểu để khởi động nhanh ứng dụng
 * Chỉ load các module cần thiết ngay lập tức
 * OPTIMIZATION: Batch read all sheets at once to avoid 429 errors
 */
function getInitialDataFast() {
    
    var result = { 
        success: true, 
        data: {
            members: [],
            contracts: [],
            priceList: [],
            pts: []
        }, 
        errors: {} 
    };
    
    try {
        clearHeaderMapCache();
        
        // OPTIMIZATION: Open spreadsheet once and cache it
        var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        
        // Add small delay between reads to avoid rate limiting
        var readWithDelay = function(fn, delay) {
            if (delay > 0) Utilities.sleep(delay);
            return fn();
        };
        
        // Load chỉ 4 module quan trọng nhất với delay giữa các lần đọc
        try {
            var members = readWithDelay(function() { return getMembers(); }, 0);
            if (members && members.error) {
                result.errors.members = members.error;
                result.data.members = [];
            } else {
                result.data.members = members || [];
            }
        } catch (err) { 
            result.errors.members = err.message || String(err);
            result.data.members = [];
        }

        try {
            var contracts = readWithDelay(function() { return getContracts(); }, 100);
            if (contracts && contracts.error) {
                result.errors.contracts = contracts.error;
                result.data.contracts = [];
            } else {
                result.data.contracts = contracts || [];
            }
        } catch (err) { 
            result.errors.contracts = err.message || String(err);
            result.data.contracts = [];
        }

        try {
            var priceList = readWithDelay(function() { return getPriceList(); }, 100);
            if (priceList && priceList.error) {
                result.errors.priceList = priceList.error;
                result.data.priceList = [];
            } else {
                result.data.priceList = priceList || [];
            }
        } catch (err) { 
            result.errors.priceList = err.message || String(err);
            result.data.priceList = [];
        }
        
        try {
            var pts = readWithDelay(function() { 
                return (typeof getPTs === 'function') ? getPTs() : []; 
            }, 100);
            if (pts && pts.error) {
                result.errors.pts = pts.error;
                result.data.pts = [];
            } else {
                result.data.pts = pts || [];
            }
        } catch (err) { 
            result.errors.pts = err.message || String(err);
            result.data.pts = [];
        }
        
        // Serialize and deserialize to ensure data is JSON-safe
        try {
            var jsonString = JSON.stringify(result);
            var safeResult = JSON.parse(jsonString);
            return safeResult;
        } catch (serializeError) {
            // Try to identify which field is causing the problem
            var safeData = {
                success: true,
                data: {
                    members: [],
                    contracts: [],
                    priceList: [],
                    pts: []
                },
                errors: {}
            };
            
            // Try each field individually
            try {
                JSON.stringify(result.data.members);
                safeData.data.members = result.data.members;
            } catch (e) {
            }
            
            try {
                JSON.stringify(result.data.contracts);
                safeData.data.contracts = result.data.contracts;
            } catch (e) {
            }
            
            try {
                JSON.stringify(result.data.priceList);
                safeData.data.priceList = result.data.priceList;
            } catch (e) {
            }
            
            try {
                JSON.stringify(result.data.pts);
                safeData.data.pts = result.data.pts;
            } catch (e) {
            }
            
            return safeData;
        }
        
    } catch (e) {
        var errorMsg = 'Critical error in getInitialDataFast: ' + (e.message || String(e));
        
        return { 
            success: false, 
            message: errorMsg,
            data: {
                members: [],
                contracts: [],
                priceList: [],
                pts: []
            },
            errors: { critical: errorMsg }
        };
    }
}

/**
 * Load các module bổ sung (gọi sau khi UI đã hiển thị)
 * OPTIMIZATION: Add delays between reads to prevent 429 errors
 */
function getAdditionalData() {
    
    try {
        var result = { success: true, data: {}, errors: {} };
        
        // Helper function to add delay between operations
        var readWithDelay = function(fn, delay) {
            if (delay > 0) Utilities.sleep(delay);
            return fn();
        };
        
        try {
            var priceListFull = readWithDelay(function() {
                return (typeof getPriceListFull === 'function') ? getPriceListFull() : [];
            }, 0);
            if (priceListFull && priceListFull.error) {
                result.data.priceListFull = [];
            } else {
                result.data.priceListFull = priceListFull || [];
            }
        } catch (err) { 
            result.data.priceListFull = [];
        }

        try {
            var policyMembers = readWithDelay(function() {
                return (typeof getPolicyMembers === 'function') ? getPolicyMembers() : [];
            }, 150);
            if (policyMembers && policyMembers.error) {
                result.data.policyMembers = [];
            } else {
                result.data.policyMembers = policyMembers || [];
            }
        } catch (err) { 
            result.data.policyMembers = [];
        }

        try {
            var policyPTs = readWithDelay(function() {
                return (typeof getPolicyPTs === 'function') ? getPolicyPTs() : [];
            }, 150);
            if (policyPTs && policyPTs.error) {
                result.data.policyPTs = [];
            } else {
                result.data.policyPTs = policyPTs || [];
            }
        } catch (err) { 
            result.data.policyPTs = [];
        }

        try {
            var programs = readWithDelay(function() {
                return (typeof getPrograms === 'function') ? getPrograms() : [];
            }, 150);
            if (programs && programs.error) {
                result.data.programs = [];
            } else {
                result.data.programs = programs || [];
            }
        } catch (err) { 
            result.data.programs = [];
        }

        try {
            var gifts = readWithDelay(function() {
                return (typeof getGifts === 'function') ? getGifts() : [];
            }, 150);
            if (gifts && gifts.error) {
                result.data.gifts = [];
            } else {
                result.data.gifts = gifts || [];
            }
        } catch (err) { 
            result.data.gifts = [];
        }

        try {
            var settings = readWithDelay(function() {
                return (typeof getSettings === 'function') ? getSettings() : [];
            }, 150);
            if (settings && settings.error) {
                result.data.settings = [];
            } else {
                result.data.settings = settings || [];
            }
        } catch (err) { 
            result.data.settings = [];
        }

        try {
            var receipts = readWithDelay(function() {
                return (typeof getReceipts === 'function') ? getReceipts() : [];
            }, 150);
            if (receipts && receipts.error) {
                result.data.receipts = [];
                result.errors.receipts = receipts.error;
            } else {
                result.data.receipts = receipts || [];
            }
        } catch (err) { 
            result.data.receipts = [];
            result.errors.receipts = err.message || String(err);
        }
        
        // Test serialization before returning
        try {
            var testJson = JSON.stringify(result);
            return JSON.parse(testJson);
        } catch (serErr) {
            
            // Try to identify problematic field
            var safeResult = { success: true, data: {}, errors: result.errors };
            
            // Test each field
            var fields = ['priceListFull', 'policyMembers', 'policyPTs', 'programs', 'gifts', 'settings', 'receipts'];
            fields.forEach(function(field) {
                try {
                    JSON.stringify(result.data[field]);
                    safeResult.data[field] = result.data[field];
                } catch (fieldErr) {
                    safeResult.data[field] = [];
                }
            });
            
            return safeResult;
        }
    } catch (e) {
        return { 
            success: false, 
            message: e.message,
            data: {
                priceListFull: [],
                policyMembers: [],
                policyPTs: [],
                programs: [],
                gifts: [],
                settings: [],
                receipts: []
            }
        };
    }
}

/**
 * Lấy toàn bộ dữ liệu khởi tạo cho ứng dụng trong một lần gọi.
 * @returns {Object} Chứa danh sách khách hàng, hợp đồng, và bảng giá.
 */
function getInitialData() {
    try {
        // Clear cache at start to ensure fresh data
        clearHeaderMapCache();
        
        var result = { success: true, data: {}, errors: {} };
        
        try {
            var members = getMembers();
            if (members && members.error) { 
                result.errors.members = members.error; 
            } else { 
                result.data.members = members || []; 
            }
        } catch (err) { 
            result.errors.members = err && err.message ? err.message : String(err); 
        }

        try {
            var contracts = getContracts();
            if (contracts && contracts.error) { 
                result.errors.contracts = contracts.error; 
            } else { 
                result.data.contracts = contracts || []; 
            }
        } catch (err) { 
            result.errors.contracts = err && err.message ? err.message : String(err); 
        }

        try {
            var priceList = getPriceList();
            if (priceList && priceList.error) { 
                result.errors.priceList = priceList.error; 
            } else { 
                result.data.priceList = priceList || []; 
            }
        } catch (err) { 
            result.errors.priceList = err && err.message ? err.message : String(err); 
        }
        
        try {
            var priceListFull = (typeof getPriceListFull === 'function') ? getPriceListFull() : [];
            if (priceListFull && priceListFull.error) { 
                result.errors.priceListFull = priceListFull.error; 
            } else { 
                result.data.priceListFull = priceListFull || []; 
            }
        } catch (err) { 
            result.errors.priceListFull = err && err.message ? err.message : String(err); 
        }

        try {
            var pts = (typeof getPTs === 'function') ? getPTs() : [];
            if (pts && pts.error) { 
                result.errors.pts = pts.error; 
            } else { 
                result.data.pts = pts || []; 
            }
        } catch (err) { 
            result.errors.pts = err && err.message ? err.message : String(err); 
        }

        try {
            var policyMembers = (typeof getPolicyMembers === 'function') ? getPolicyMembers() : [];
            if (policyMembers && policyMembers.error) { 
                result.errors.policyMembers = policyMembers.error; 
            } else { 
                result.data.policyMembers = policyMembers || []; 
            }
        } catch (err) { 
            result.errors.policyMembers = err && err.message ? err.message : String(err); 
        }

        try {
            var policyPTs = (typeof getPolicyPTs === 'function') ? getPolicyPTs() : [];
            if (policyPTs && policyPTs.error) { 
                result.errors.policyPTs = policyPTs.error; 
            } else { 
                result.data.policyPTs = policyPTs || []; 
            }
        } catch (err) { 
            result.errors.policyPTs = err && err.message ? err.message : String(err); 
        }

        try {
            var programs = (typeof getPrograms === 'function') ? getPrograms() : [];
            if (programs && programs.error) { 
                result.errors.programs = programs.error; 
            } else { 
                result.data.programs = programs || []; 
            }
        } catch (err) { 
            result.errors.programs = err && err.message ? err.message : String(err); 
        }

        try {
            var gifts = (typeof getGifts === 'function') ? getGifts() : [];
            if (gifts && gifts.error) { 
                result.errors.gifts = gifts.error; 
            } else { 
                result.data.gifts = gifts || []; 
            }
        } catch (err) { 
            result.errors.gifts = err && err.message ? err.message : String(err); 
        }

        try {
            var settings = (typeof getSettings === 'function') ? getSettings() : [];
            if (settings && settings.error) { 
                result.errors.settings = settings.error; 
            } else { 
                result.data.settings = settings || []; 
            }
        } catch (err) { 
            // Không fail nếu sheet cai_dat chưa tồn tại
            result.errors.settings = err && err.message ? err.message : String(err);
            result.data.settings = []; // Return empty array instead of failing
        }

        try {
            var receipts = (typeof getReceipts === 'function') ? getReceipts() : [];
            if (receipts && receipts.error) { 
                result.errors.receipts = receipts.error; 
            } else { 
                result.data.receipts = receipts || []; 
            }
        } catch (err) { 
            result.errors.receipts = err && err.message ? err.message : String(err);
            result.data.receipts = [];
        }

        // CHANGED: Chỉ trả về lỗi nếu có lỗi nghiêm trọng (không phải settings)
        var criticalErrors = {};
        Object.keys(result.errors).forEach(function(key) {
            if (key !== 'settings') { // Settings is optional
                criticalErrors[key] = result.errors[key];
            }
        });
        
        // Nếu có lỗi nghiêm trọng, trả về success: false
        if (Object.keys(criticalErrors).length > 0) {
            return { success: false, message: 'Có lỗi khi lấy dữ liệu backend', details: result.errors };
        }

        // Clean data to ensure serialization works
        var cleanData = {
            members: JSON.parse(JSON.stringify(result.data.members || [])),
            contracts: JSON.parse(JSON.stringify(result.data.contracts || [])),
            priceList: JSON.parse(JSON.stringify(result.data.priceList || [])),
            priceListFull: JSON.parse(JSON.stringify(result.data.priceListFull || [])),
            pts: JSON.parse(JSON.stringify(result.data.pts || [])),
            policyMembers: JSON.parse(JSON.stringify(result.data.policyMembers || [])),
            policyPTs: JSON.parse(JSON.stringify(result.data.policyPTs || [])),
            programs: JSON.parse(JSON.stringify(result.data.programs || [])),
            gifts: JSON.parse(JSON.stringify(result.data.gifts || [])),
            settings: JSON.parse(JSON.stringify(result.data.settings || [])),
            receipts: JSON.parse(JSON.stringify(result.data.receipts || []))
        };
        
        return { success: true, data: cleanData };
        
    } catch (e) {
        return { success: false, message: 'Exception in getInitialData: ' + (e && e.message ? e.message : String(e)) };
    }
}

/**
 * Diagnostic helper callable from client or Editor to check spreadsheet/sheet availability.
 * Trả về object mô tả trạng thái của spreadsheet và các sheet quan trọng.
 */
function diagnoseBackend() {
    try {
        var info = { spreadsheetId: SPREADSHEET_ID || null, okSpreadsheet: false, spreadsheetName: null, sheets: {} };
        if (!SPREADSHEET_ID) return { success: false, message: 'SPREADSHEET_ID chưa được cấu hình.' };
        var ss;
        try {
            ss = SpreadsheetApp.openById(SPREADSHEET_ID);
            info.okSpreadsheet = true;
            info.spreadsheetName = ss.getName();
        } catch (e) {
            return { success: false, message: 'Không thể mở Spreadsheet bằng ID đã cấu hình: ' + (e && e.message ? e.message : String(e)) };
        }

        var expectedSheets = ['khach_hang', 'hop_dong', 'bang_gia', 'PT', 'chinh_sach_hoi_vien', 'chinh_sach_PT', 'chuong_trinh', 'qua_tang', 'cau_hinh', 'phieu_thu'];
        expectedSheets.forEach(function(name) {
            try {
                var sh = ss.getSheetByName(name);
                if (!sh) {
                    info.sheets[name] = { exists: false };
                } else {
                    var lastCol = sh.getLastColumn();
                    var headers = lastCol > 0 ? sh.getRange(1, 1, 1, lastCol).getValues()[0] : [];
                    info.sheets[name] = { exists: true, lastRow: sh.getLastRow(), lastCol: lastCol, headers: headers };
                }
            } catch (e2) {
                info.sheets[name] = { exists: false, error: e2 && e2.message ? e2.message : String(e2) };
            }
        });

        return { success: true, info: info };
    } catch (e) {
        return { success: false, message: e && e.message ? e.message : String(e), stack: e && e.stack ? e.stack.toString() : null };
    }
}