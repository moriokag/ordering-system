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
/**
 * 発注情報をスプレッドシートに記録する
 */
function saveOrderToSheet(orderData) {
  try {
    // スプレッドシートを開く
    const ss = SpreadsheetApp.openById('1r01fBuvl3F38XVe4zqPshXy0H0P9izQquuJNZFzpH5k'); // スプレッドシートIDを実際のものに変更
    
    // 注文履歴シートを取得（なければ作成）
    let orderSheet = ss.getSheetByName('注文履歴');
    if (!orderSheet) {
      orderSheet = ss.insertSheet('注文履歴');
      // ヘッダー行を設定
      orderSheet.appendRow([
        '注文日時', '発注者', '注文方式', 
        '納入業者', '商品数', '詳細', 'ステータス'
      ]);
      
      // ヘッダー行の書式設定
      orderSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#f3f3f3');
    }
    
    // 現在の日時
    const now = new Date();
    
    // 各ベンダーの注文を記録
    Object.entries(orderData.vendorOrders).forEach(([vendor, items]) => {
      // 商品の合計数を計算
      const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
      
      // 詳細情報をJSON形式で保存
      const details = JSON.stringify(items);
      
      // 行データを作成
      const rowData = [
        now,                   // 注文日時
        orderData.requester,   // 発注者 
        orderData.mode,        // 注文方式
        vendor,                // 納入業者
        totalItems,            // 商品数
        details,               // 詳細（JSON）
        '処理中'               // ステータス（初期値）
      ];
      
      // シートに追加
      orderSheet.appendRow(rowData);
    });
    
    // 日付フォーマットを設定
    const lastRow = orderSheet.getLastRow();
    const startRow = Math.max(2, lastRow - Object.keys(orderData.vendorOrders).length + 1);
    if (lastRow >= startRow) {
      orderSheet.getRange(startRow, 1, lastRow - startRow + 1, 1).setNumberFormat('yyyy/MM/dd HH:mm:ss');
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}