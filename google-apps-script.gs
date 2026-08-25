function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (data.action === "delete" && data.id) {
      var values = sheet.getDataRange().getValues();
      for (var row = values.length - 1; row >= 0; row--) {
        if (String(values[row][0]) === String(data.id)) {
          sheet.deleteRow(row + 1);
          break;
        }
      }
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (sheet.getLastRow() === 0 || !sheet.getRange(1, 1).getValue()) {
      sheet.appendRow(["Bestell-Nr", "Datum", "Name", "E-Mail", "Telefon", "Produkte", "Versand", "Zahlung", "Gesamt", "Anmerkung"]);
    }

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

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var values = sheet.getDataRange().getValues();
  var firstRowIsOrder = values.length && String(values[0][0]).indexOf("KP-") === 0;
  var orders = values.slice(firstRowIsOrder ? 0 : 1).filter(function(row) {
    return row[0];
  }).map(function(row) {
    var productText = String(row[5] || "");
    var items = productText.split('; ').filter(Boolean).map(function(product) {
      var match = product.match(/^(.*?) x(\d+) \((.*)\)$/);
      return {
        name: match ? match[1] : product,
        qty: match ? Number(match[2]) : 1,
        colors: match ? match[3].split('/').map(function(detail) { return detail.split(',')[0].trim(); }) : [],
        sizes: [],
        texts: []
      };
    });
    return {
      id: String(row[0]),
      date: row[1] || new Date().toISOString(),
      items: items,
      total: Number(row[8]) || 0,
      shipping: String(row[6] || ""),
      payment: String(row[7] || ""),
      customer: {
        name: String(row[2] || ""),
        email: String(row[3] || ""),
        phone: String(row[4] || ""),
        note: String(row[9] || "")
      },
      status: "in planung",
      completed: false
    };
  });
  var result = JSON.stringify({ ok: true, orders: orders });
  var callback = e && e.parameter ? e.parameter.callback : "";
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + "(" + result + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(result)
    .setMimeType(ContentService.MimeType.JSON);
}
