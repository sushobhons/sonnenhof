import { toast } from "react-toastify";

const cleanText = (str) =>
  str
    ?.toString()
    .replace(/[^\x20-\x7E]/g, "") // Remove non-printable ASCII
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();

/**
 * Export JSON to CSV file.
 */
export const exportToCSV = (data, filename = "export", mapFn = null) => {
  if (!data.length) {
    toast.error("No data to export.");
    return;
  }

  const mappedData = mapFn ? data.map(mapFn) : data;

  const headers = Object.keys(mappedData[0]);
  const csvRows = [
    headers.join(","), // header row
    ...mappedData.map((row) =>
      headers
        .map((key) => {
          const value = row[key] ?? "";
          return `"${cleanText(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];

  // ✅ Prepend UTF-8 BOM
  const csvContent = "\uFEFF" + csvRows.join("\n");

  // ✅ Use TextEncoder to ensure UTF-8 encoding
  const utf8Encoder = new TextEncoder();
  const blob = new Blob([utf8Encoder.encode(csvContent)], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Print table from JSON data.
 */
export const printData = (data = [], columns = [], title = "Print Preview") => {
  if (!data.length) {
    toast.error("No data to print.");
    return;
  }

  const tableHead = `<tr>${columns
    .map((col) => `<th>${col.label}</th>`)
    .join("")}</tr>`;
  const tableRows = data
    .map(
      (row) =>
        `<tr>${columns.map((col) => `<td>${row[col.key]}</td>`).join("")}</tr>`
    )
    .join("");

  const html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <table>
          <thead>${tableHead}</thead>
          <tbody>${tableRows}</tbody>
        </table>
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(html);
  printWindow.document.close();
};
