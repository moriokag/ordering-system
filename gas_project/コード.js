function doGet() {
  const template = HtmlService.createTemplateFromFile('index');
  template.items = getItemData();  // ← データをテンプレに渡す
  return template.evaluate();
}

function getItemData() {
  const ss = SpreadsheetApp.openById('1r01fBuvl3F38XVe4zqPshXy0H0P9izQquuJNZFzpH5k');
  const sheet = ss.getSheetByName('シート1');
  const values = sheet.getDataRange().getValues();
  const data = values.slice(1).map(row => {
    return {
      id: row[0],
      name: row[1],
      kana: row[2],
      category: row[3],
      size: row[4],
      manufacturer: row[5],
      vendor: row[6],
      price: row[7],
      unit: row[8],
      minStock: row[9],
      orderable: row[10],
      location: row[11],
      note: row[12],
    };
  });
  return data;
}
