const ExcelJS = require('exceljs');
const fs = require('fs');

async function generateReport(results) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('E2E Test Results');

  worksheet.columns = [
    { header: 'Test Name', key: 'name', width: 30 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Error Details', key: 'error', width: 50 }
  ];

  // Header styling
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  results.forEach(res => {
    const row = worksheet.addRow({
      name: res.name,
      status: res.status,
      duration: res.duration,
      error: res.error || 'N/A'
    });

    if (res.status === 'PASS') {
      row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      row.getCell('status').font = { color: { argb: 'FF006100' } };
    } else {
      row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
      row.getCell('status').font = { color: { argb: 'FF9C0006' } };
    }
  });

  const filePath = 'Test_Report.xlsx';
  await workbook.xlsx.writeFile(filePath);
  console.log(`[Report] Generated Excel report at ${filePath}`);
}

module.exports = { generateReport };
