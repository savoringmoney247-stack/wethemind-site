/**
 * We The Mind — booking &amp; session-request forms → Google Sheet
 *
 * SETUP (5 minutes):
 * 1. Go to https://sheets.google.com and create a new blank spreadsheet.
 *    Name it something like "We The Mind — Demo Bookings".
 * 2. In the sheet, go to Extensions → Apps Script.
 * 3. Delete any starter code and paste this whole file in.
 * 4. Click Deploy → New deployment.
 *    - Select type: "Web app"
 *    - Description: "Booking form endpoint"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 5. Click Deploy, authorize it (it's your own script, on your own sheet),
 *    and copy the Web app URL — it ends in /exec.
 * 6. Paste that URL into index.html, replacing the value of
 *    data-endpoint="YOUR_GOOGLE_APPS_SCRIPT_URL" on both
 *    <form id="demo-form"> and <form id="mass-session-form">.
 * 7. Book a test session on your live page and confirm a new row appears
 *    in the "Responses" sheet tab.
 *
 * Single Problem-Solving Session bookings can include an uploaded photo,
 * PDF, or document (max 10 MB, enforced client-side). Uploaded files are
 * saved into a Drive folder named "We The Mind — Problem Uploads" (created
 * automatically the first time one is submitted), and the row in the sheet
 * gets a link to that file instead of the raw binary.
 *
 * If you ever change a form's fields, update the HEADERS array below to
 * match the field's "name" attribute in the HTML form.
 */

var SHEET_NAME = 'Responses';
var UPLOAD_FOLDER_NAME = 'We The Mind — Problem Uploads';
var MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

var HEADERS = [
  'Timestamp',
  'Session Type',
  'Parent Name',
  'Student Name',
  'Email',
  'Phone',
  'Curriculum',
  'Grade',
  'Notes / Topic',
  'Preferred Date',
  'Problem File Link',
  'Referred By',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign'
];

/**
 * REFERRAL CREDITS (manual, by design — this is a small tutoring business,
 * not worth automating credit issuance for).
 * Whenever "Referred By" is filled in on a booking, check it against past
 * rows: if that name/email has booked and PAID before, both the new
 * student and the referrer get one free session credit. Just eyeball the
 * "Referred By" column periodically and apply credits yourself — there's
 * no code to write for this part, only a habit to keep.
 */

function doPost(e) {
  var sheet = getOrCreateSheet_();
  var data = (e && e.parameter) || {};
  var files = (e && e.files) || {};

  var fileLink = '';
  var uploaded = files.problem_file;
  if (uploaded) {
    var blob = Array.isArray(uploaded) ? uploaded[0] : uploaded;
    if (blob && typeof blob.getBytes === 'function' && blob.getBytes().length > 0) {
      if (blob.getBytes().length > MAX_UPLOAD_BYTES) {
        return ContentService
          .createTextOutput(JSON.stringify({ result: 'error', message: 'File exceeds 10 MB.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var folder = getOrCreateUploadFolder_();
      var savedFile = folder.createFile(blob);
      savedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileLink = savedFile.getUrl();
    }
  }

  sheet.appendRow([
    new Date(),
    data.session_type || '',
    data.parent_name || '',
    data.student_name || '',
    data.email || '',
    data.phone || '',
    data.curriculum || '',
    data.grade || '',
    data.notes || '',
    data.preferred_date || '',
    fileLink,
    data.referred_by || '',
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
    .createTextOutput('We The Mind booking endpoint is live. Submit via POST.')
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

function getOrCreateUploadFolder_() {
  var folders = DriveApp.getFoldersByName(UPLOAD_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(UPLOAD_FOLDER_NAME);
}
