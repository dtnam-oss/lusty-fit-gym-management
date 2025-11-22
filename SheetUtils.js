// Helper nhỏ để cache header maps trong cùng một execution (giảm gọi indexOf nhiều lần)
var HEADER_MAP_CACHE = HEADER_MAP_CACHE || {};

/**
 * Trả về map: headerName -> columnIndex (0-based) cho sheet.
 * Cache theo tên sheet trong execution hiện tại để tiết kiệm getRange trên hàng tiêu đề.
 */
function getHeaderMap(sheet) {
  if (!sheet) throw new Error('sheet is required for getHeaderMap');
  var name = sheet.getName();
  if (HEADER_MAP_CACHE[name]) return HEADER_MAP_CACHE[name];
  var lastCol = sheet.getLastColumn();
  if (lastCol <= 0) { HEADER_MAP_CACHE[name] = {}; return {}; }
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    map[headers[i]] = i;
  }
  HEADER_MAP_CACHE[name] = map;
  return map;
}

/**
 * Xóa cache (tiện cho debug nếu cần)
 */
function clearHeaderMapCache() {
  HEADER_MAP_CACHE = {};
}
