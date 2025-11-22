// =================================================================
// CẤU HÌNH API - Google Apps Script Web App URL
// =================================================================
// Sau khi deploy Web App từ Google Apps Script, cập nhật URL này
const API_CONFIG = {
    // TODO: Cập nhật URL này sau khi deploy Web App từ Google Apps Script
    // Định dạng: https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
    WEB_APP_URL: 'YOUR_WEB_APP_URL_HERE',
    
    // Thời gian timeout cho requests (milliseconds)
    TIMEOUT: 30000,
    
    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000
};

// =================================================================
// API WRAPPER - Thay thế google.script.run bằng fetch calls
// =================================================================
class GASApi {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    /**
     * Generic method to call Google Apps Script functions
     * @param {string} functionName - Name of the GAS function to call
     * @param {object} params - Parameters to pass to the function
     * @returns {Promise} - Promise that resolves with the function result
     */
    async call(functionName, params = {}) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    function: functionName,
                    parameters: params
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error calling ${functionName}:`, error);
            throw error;
        }
    }
    
    // Convenience methods for each controller function
    // AppDataController
    getAllAppData() { return this.call('getAllAppData'); }
    
    // MemberController
    getMembers() { return this.call('getMembers'); }
    getMemberById(id) { return this.call('getMemberById', { id }); }
    addMember(data) { return this.call('addMember', data); }
    updateMember(data) { return this.call('updateMember', data); }
    deleteMember(id) { return this.call('deleteMember', { id }); }
    searchMembers(query) { return this.call('searchMembers', { query }); }
    
    // ContractController
    getContracts() { return this.call('getContracts'); }
    getContractById(id) { return this.call('getContractById', { id }); }
    addContract(data) { return this.call('addContract', data); }
    updateContract(data) { return this.call('updateContract', data); }
    deleteContract(id) { return this.call('deleteContract', { id }); }
    
    // PTController
    getPTs() { return this.call('getPTs'); }
    getPTById(id) { return this.call('getPTById', { id }); }
    addPT(data) { return this.call('addPT', data); }
    updatePT(data) { return this.call('updatePT', data); }
    deletePT(id) { return this.call('deletePT', { id }); }
    
    // PriceListController
    getPriceList() { return this.call('getPriceList'); }
    getPriceListFull() { return this.call('getPriceListFull'); }
    addPriceItem(data) { return this.call('addPriceItem', data); }
    updatePriceItem(data) { return this.call('updatePriceItem', data); }
    deletePriceItem(id) { return this.call('deletePriceItem', { id }); }
    
    // PolicyMemberController
    getPolicyMembers() { return this.call('getPolicyMembers'); }
    addPolicyMember(data) { return this.call('addPolicyMember', data); }
    updatePolicyMember(data) { return this.call('updatePolicyMember', data); }
    deletePolicyMember(id) { return this.call('deletePolicyMember', { id }); }
    
    // PolicyPTController
    getPolicyPTs() { return this.call('getPolicyPTs'); }
    addPolicyPT(data) { return this.call('addPolicyPT', data); }
    updatePolicyPT(data) { return this.call('updatePolicyPT', data); }
    deletePolicyPT(id) { return this.call('deletePolicyPT', { id }); }
    
    // ProgramController
    getPrograms() { return this.call('getPrograms'); }
    addProgram(data) { return this.call('addProgram', data); }
    updateProgram(data) { return this.call('updateProgram', data); }
    deleteProgram(id) { return this.call('deleteProgram', { id }); }
    
    // GiftController
    getGifts() { return this.call('getGifts'); }
    addGift(data) { return this.call('addGift', data); }
    updateGift(data) { return this.call('updateGift', data); }
    deleteGift(id) { return this.call('deleteGift', { id }); }
    
    // SettingsController
    getSettings() { return this.call('getSettings'); }
    updateSettings(data) { return this.call('updateSettings', data); }
    
    // ReceiptController
    getReceipts() { return this.call('getReceipts'); }
    addReceipt(data) { return this.call('addReceipt', data); }
    updateReceipt(data) { return this.call('updateReceipt', data); }
    deleteReceipt(id) { return this.call('deleteReceipt', { id }); }
    printReceipt(id) { return this.call('printReceipt', { id }); }
    
    // MemberPointsController
    calculateMemberPoints(data) { return this.call('calculateMemberPoints', data); }
    calculatePTPoints(data) { return this.call('calculatePTPoints', data); }
}

// Initialize API instance
const gasApi = new GASApi(API_CONFIG.WEB_APP_URL);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, GASApi, gasApi };
}
