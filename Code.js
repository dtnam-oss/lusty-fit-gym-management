/**
 * Hàm chính để hiển thị Web App khi người dùng truy cập URL.
 * @returns {HtmlOutput} Giao diện người dùng của ứng dụng.
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Lusty Fit CRM System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/**
 * Hàm này dùng để bao gồm các file HTML khác vào file chính.
 * @param {string} filename Tên của file HTML cần import (không cần .html).
 * @returns {string} Nội dung của file HTML.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Simple test function to verify google.script.run is working
 */
function testConnection() {
  return { success: true, message: 'Connection OK', timestamp: new Date().toISOString() };
}