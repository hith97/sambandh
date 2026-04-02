const SHEET_ID = '1bGBJwSpJY2JmT3F-FaOYkw4m_nxeBPknJ2KwUHp1Sp8';
const SHEET_NAME = 'Sheet1';

function getSheet_() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
}

function getPayload_(e) {
  var rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '';

  if (rawBody) {
    try {
      return JSON.parse(rawBody);
    } catch (error) {
      // Fall back to standard form fields when the request is not JSON.
    }
  }

  return e && e.parameter ? e.parameter : {};
}

function doPost(e) {
  try {
    var sheet = getSheet_();
    var data = getPayload_(e);
    var name = (data.name || '').toString().trim();
    var phone = (data.phoneNumber || data.phone || '').toString().trim();
    var district = (data.district || '').toString().trim();
    var state = (data.state || '').toString().trim();

    if (!name && !phone && !district && !state) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, message: 'No data received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([name, phone, district, state]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return doPost(e);
}
