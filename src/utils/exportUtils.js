export const normalizeText = (value) =>
  String(value || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const downloadTextFile = (filename, content, mimeType = "text/plain;charset=utf-8") => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export const createCsv = (headers, rows) => {
  const lines = [headers.map(csvEscape).join(";")];
  rows.forEach((row) => {
    lines.push(headers.map((header) => csvEscape(row[header])).join(";"));
  });
  return `\ufeff${lines.join("\n")}`;
};

export const excelEscape = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const createExcelTable = (title, headers, rows) => {
  const headerCells = headers.map((header) => `<th>${excelEscape(header)}</th>`).join("");
  const bodyRows = rows
    .map((row) => `<tr>${headers.map((header) => `<td>${excelEscape(row[header])}</td>`).join("")}</tr>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; }
    th { background: #f3d7df; font-weight: 700; }
    th, td { border: 1px solid #9f4f68; padding: 8px 10px; }
  </style>
</head>
<body>
  <h2>${excelEscape(title)}</h2>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
</body>
</html>`;
};
