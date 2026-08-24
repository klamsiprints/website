function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    sheet.appendRow([
      data.id || "",
      data.date || new Date().toISOString(),
      data.name || "",
      data.email || "",
      data.phone || "",
      data.products || "",
      data.shipping || "",
      data.payment || "",
      data.total || 0,
      data.note || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput("KlamsiPrints Google Sheets Verbindung ist aktiv.")
    .setMimeType(ContentService.MimeType.TEXT);
}
