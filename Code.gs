/**
 * We the Mind — demo booking form → Google Sheet
 *
 * SETUP (5 minutes):
 * 1. Go to https://sheets.google.com and create a new blank spreadsheet.
 *    Name it something like "We the Mind — Demo Bookings".
 * 2. In the sheet, go to Extensions → Apps Script.
 * 3. Delete any starter code and paste this whole file in.
 * 4. Click Deploy → New deployment.
 *    - Select type: "Web app"
 *    - Description: "Demo form endpoint"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 5. Click Deploy, authorize it (it's your own script, on your own sheet),
 *    and copy the Web app URL — it ends in /exec.
 * 6. Paste that URL into index.html, replacing the value of
 *    data-endpoint="YOUR_GOOGLE_APPS_SCRIPT_URL" on the <form id="demo-form">.
 * 7. Book a test session on your live page and confirm a new row appears
 *    in the sheet.
 *
 * If you ever change the form's fields, update the HEADERS array below to
 * match the field's "name" attribute in the HTML form.
 */

var SHEET_NAME = 'Responses';

var HEADERS = [
  'Timestamp',
  'Parent Name',
  'Student Name',
  'Email',
  'Phone',
  'Curriculum',
  'Grade',
  'Notes',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign'
];

function doPost(e) {
  var sheet = getOrCreateSheet_();
  var data = (e && e.parameter) || {};

  sheet.appendRow([
    new Date(),
    data.parent_name || '',
    data.student_name || '',
    data.email || '',
    data.phone || '',
    data.curriculum || '',
    data.grade || '',
    data.notes || '',
    data.utm_source || '',
    data.utm_medium || '',
    data.utm_campaign || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Lets you sanity-check the deployed URL in a browser (GET request).
function doGet(e) {
  return ContentService
    .createTextOutput('We the Mind booking endpoint is live. Submit via POST.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
