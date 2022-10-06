/**
 * Create Approval URI (based off of https://github.com/g-r3m/GASapprovalGoogleFormworkflow)
 * param {string}: Script URI
 * param {string}: UUID generated
 * return {string}: Generated URI
 */
function approveURI_(scriptUri, Uuid){
 return scriptUri + "?id=" + Uuid + '&state=' + APPROVED_STATE;
} 
/**
 * Create Deny URI (based off of https://github.com/g-r3m/GASapprovalGoogleFormworkflow)
 * param {string}: Script URI
 * param {string}: UUID generated
 * return {string}: Generated URI
 */
function denyURI_(scriptUri, Uuid){
 return scriptUri + "?id=" + Uuid + '&state=' + DENIED_STATE;
}

/**
 * Debug function test.
 */
function lastTest() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET)
  var lastRow = sh.getLastRow()
  Logger.log(lastRow)
  Logger.log(sh.getRange(LOG_SHEET+"!A2:A"+lastRow).getValues()[0])
}

function newUuid() {
  return Utilities.getUuid();
}
