// todo: create timebased trigger to send reminders

function findForm(uuid) {

  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET)
  var lastRow = sh.getLastRow()

  if(lastRow == 1) {
    return {
      row: lastRow + 1,
      requestor: null,
      company: null,
      email: null,
      type: null,
      uuid: null,
      approve: null,
      deny: null,
      approved: null
    }
  }

  uuidList = sh.getRange(LOG_SHEET+"!A2:A"+lastRow).getValues()
  for(var i = 0; i < uuidList.length; i++) {

    if(uuidList[i][0] == uuid) {

      var row = i + 2
      return {
        row: row,
        requestor: Session.getActiveUser().getEmail(),
        company: sh.getRange(row, 3).getValue(),
        email: sh.getRange(row, 4).getValue(),
        type: sh.getRange(row, 5).getValue(),
        uuid: sh.getRange(row, 1).getValue(),
        approve: sh.getRange(row, 6).getValue(),
        deny: sh.getRange(row, 7).getValue(),
        approved: sh.getRange(row, 8).getValue()
      }

    }

  }

  return {
    row: lastRow + 1,
    requestor: null,
    company: null,
    email: null,
    type: null,
    uuid: null,
    approve: null,
    deny: null,
    approved: null
  }

}

function findCo(uuid) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MAIN_SHEET)
  uuidList = sh.getRange(2, 8, sh.getLastRow()).getValues()

  for(var i = 0; i < uuidList.length; i++) {

    if(uuidList[i][0] == uuid) return i + 2

  }
}

function write(form) {

  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET)
  var array = [[form.uuid, form.requestor, form.company, form.email, form.type, form.approve, form.deny, form.approved]]
  var newRange = sh.getRange(LOG_SHEET+"!A"+form.row+":H"+form.row)
  newRange.setValues(array)

}

function sendRequest(form) {

  var templ = HtmlService.createTemplateFromFile("RequestEmail");
  templ.form = form;

  MailApp.sendEmail({
    to:APPROVER_EMAIL,
    cc:TEMP_CC,
    subject:"Contact Requires Approval" + " - " + form.company,
    htmlBody: templ.evaluate().getContent()
  })

  write(form)

};

function runOnEdit(e) {

  var sh=e.range.getSheet();
  var col = e.range.columnStart
  var row = e.range.rowStart

  if(col == 5 && e.value.includes("Awaiting approval")) {
    var form = {
      row: findForm(sh.getRange(row, 8).getValue()).row,
      requestor: sh.getRange(row, 2).getValue(),
      company: sh.getRange(row, 1).getValue(),
      email: sh.getRange(row, 3).getValue(),
      type: sh.getRange(row, 6).getValue(),
      uuid: sh.getRange(row, 8).getValue(),
      approve: approveURI_(DEPLOY_ID, sh.getRange(row, 8).getValue()),
      deny: denyURI_(DEPLOY_ID, sh.getRange(row, 8).getValue()),
      approved: PENDING_STATE
    }

    sendRequest(form); 
  }
  
};

function doGet(request) {

  var user = Session.getActiveUser().getEmail();

  form = findForm(request.parameters.id)

  write({
    row: form.row,
    requestor: form.requestor,
    company: form.company,
    email: form.email,
    type: form.type,
    uuid: request.parameters.id,
    approve: form.approve,
    deny: form.deny,
    approved: request.parameters.state
  })

  row = findCo(request.parameters.id);

  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MAIN_SHEET)
  var newRange = sh.getRange(row, 5)
  newRange.setValues([[
    request.parameters.state == APPROVED_STATE ? "Approved" : "Denied"
  ]])

  var templ = HtmlService.createTemplateFromFile(request.parameters.state == APPROVED_STATE ? "ApproveEmail" : "DenyEmail");
  templ.form = {company: form.company, uuid:request.parameters.id};


  MailApp.sendEmail({
    to:form.requestor,
    cc:TEMP_CC,
    subject:"Contact " + request.parameters.state + " - " + form.company,
    htmlBody: templ.evaluate().getContent()
  })

  // todo update first sheet
  return ContentService.createTextOutput('Thank you. Your response has been recorded.\nUUID: ' + request.parameters.id + '\nCompany: ' + form.company);
};
