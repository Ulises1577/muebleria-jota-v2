/**
 * Genera y descarga un CSV en el navegador (separador ";" y BOM para que Excel en español lo abra bien).
 * @param {string} filename
 * @param {Array<{ label: string, value: (row: any) => any }>} columns
 * @param {Array<any>} rows
 */
export const downloadCsv = (filename, columns, rows) => {
  const escape = (raw) => {
    const value = raw === null || raw === undefined ? '' : String(raw);
    return /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  };

  const lines = [
    columns.map((column) => escape(column.label)).join(';'),
    ...rows.map((row) => columns.map((column) => escape(column.value(row))).join(';'))
  ];

  const blob = new Blob([`﻿${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const todayStamp = () => new Date().toISOString().slice(0, 10);
