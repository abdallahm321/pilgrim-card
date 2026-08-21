function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return responseJSON({ error: "Empty Sheet" });

  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const p = (e && e.parameter) ? e.parameter : {};
  const action = p.action ? String(p.action).trim().toLowerCase() : "read";
  const rawGroupId = p.g || p.group_id;
  const groupId = rawGroupId ? String(rawGroupId).trim().toUpperCase() : null;

  // 1. جلب قائمة كل الأفواج المسجلة (للقائمة المنسدلة)
  if (action === "list") {
    const gIdx = headers.indexOf("group_id");
    const cIdx = headers.indexOf("company_name");
    let groupsList = [];
    for (let i = 1; i < data.length; i++) {
      const gid = String(data[i][gIdx] || "").trim().toUpperCase();
      const comp = String(data[i][cIdx] || "رحلة عمرة").trim();
      if (gid !== "") {
        groupsList.push({ id: gid, name: comp });
      }
    }
    return responseJSON({ groups: groupsList });
  }

  // 2. قراءة بيانات فوج محدد
  if (action === "read") {
    if (!groupId) return responseJSON({ error: "Missing Group ID" });
    const gIndex = headers.indexOf("group_id");
    if (gIndex === -1) return responseJSON({ error: "group_id column not found" });

    for (let i = 1; i < data.length; i++) {
      const cellGroupId = String(data[i][gIndex] || "").trim().toUpperCase();
      if (cellGroupId === groupId) {
        let record = {};
        headers.forEach((key, colIdx) => {
          if (key !== "pin") record[key] = String(data[i][colIdx] || "");
        });
        return responseJSON(record);
      }
    }
    return responseJSON({ error: "Group Not Found" });
  }

  // 3. تحديث بيانات فوج
  if (action === "update") {
    const rawPin = p.pin;
    const pin = rawPin ? String(rawPin).trim() : null;
    const gIndex = headers.indexOf("group_id");
    const pinIndex = headers.indexOf("pin");

    if (gIndex === -1 || pinIndex === -1) return responseJSON({ success: false, msg: "Missing header config" });
    if (!groupId || !pin) return responseJSON({ success: false, msg: "Missing Credentials" });

    for (let i = 1; i < data.length; i++) {
      const cellGroupId = String(data[i][gIndex] || "").trim().toUpperCase();
      const cellPin = String(data[i][pinIndex] || "").trim();

      if (cellGroupId === groupId) {
        if (cellPin === pin) {
          headers.forEach((key, colIdx) => {
            if (p[key] !== undefined && key !== "group_id" && key !== "pin") {
              sheet.getRange(i + 1, colIdx + 1).setValue(p[key]);
            }
          });
          return responseJSON({ success: true });
        } else {
          return responseJSON({ success: false, msg: "رمز المرور (PIN) غير صحيح" });
        }
      }
    }
    return responseJSON({ success: false, msg: "معرف الفوج غير مسجل بالشيت" });
  }

  return responseJSON({ error: "Invalid Action" });
}

function doPost(e) { return doGet(e); }

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
