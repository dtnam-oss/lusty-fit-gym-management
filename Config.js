// ID của Google Sheet đang sử dụng
const SPREADSHEET_ID = "1aXEGwB-QhD-7f3TtWVWwidpk738aT8PRaeClHEstNO0"; // <<<--- ID CỦA BẠN

// Lazy getter functions để tránh crash khi load nếu sheet không tồn tại
var _spreadsheet = null;
var _membersSheet = null;
var _priceListSheet = null;
var _contractsSheet = null;
var _ptSheet = null;
var _settingsSheet = null;

function getSpreadsheet() {
  if (!_spreadsheet) _spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return _spreadsheet;
}

function getMembersSheet() {
  if (!_membersSheet) _membersSheet = getSpreadsheet().getSheetByName("khach_hang");
  return _membersSheet;
}

function getPriceListSheet() {
  if (!_priceListSheet) _priceListSheet = getSpreadsheet().getSheetByName("bang_gia");
  return _priceListSheet;
}

function getContractsSheet() {
  if (!_contractsSheet) _contractsSheet = getSpreadsheet().getSheetByName("hop_dong");
  return _contractsSheet;
}

function getPTSheet() {
  if (!_ptSheet) _ptSheet = getSpreadsheet().getSheetByName("PT");
  return _ptSheet;
}

function getSettingsSheet() {
  if (!_settingsSheet) _settingsSheet = getSpreadsheet().getSheetByName("cau_hinh");
  return _settingsSheet;
}

// Legacy constants for backward compatibility (deprecated, use getter functions above)
var SPREADSHEET = null; // use getSpreadsheet() instead
var MEMBERS_SHEET = null; // use getMembersSheet() instead
var PRICE_LIST_SHEET = null; // use getPriceListSheet() instead
var CONTRACTS_SHEET = null; // use getContractsSheet() instead
var PT_SHEET = null; // use getPTSheet() instead

// ID cho việc in hợp đồng
const CONTRACT_TEMPLATE_ID = "YOUR_GOOGLE_DOC_TEMPLATE_ID";
const CONTRACT_EXPORT_FOLDER_ID = "1TOR1g-pxtpbeQPhA8_Sy8WpU4_TVowL8";