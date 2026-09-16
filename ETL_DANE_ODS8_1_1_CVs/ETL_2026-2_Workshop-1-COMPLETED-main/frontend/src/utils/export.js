import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { monthLabel } from './format';

/* ---------- CSV ---------- */

function escapeCell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function rowsToCSV(rows, headers) {
  const head = headers.map((h) => escapeCell(h.label)).join(',');
  const lines = rows.map((r) => headers.map((h) => escapeCell(h.get ? h.get(r) : r[h.key])).join(','));
  return ['\ufeff' + head, ...lines].join('\n');
}

export function downloadCSV(filename, rows, headers) {
  const csv = rowsToCSV(rows, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

export const CSV_DEFS = {
  monthly: {
    file: 'R1_ventas_por_mes.csv',
    headers: [
      { label: 'periodo', get: (r) => monthLabel(r.year, r.month) },
      { label: 'year', key: 'year' },
      { label: 'month', key: 'month' },
      { label: 'total_revenue', key: 'total_revenue' },
    ],
  },
  avgQty: {
    file: 'R2_cantidad_promedio_por_producto.csv',
    headers: [
      { label: 'product_name', key: 'product_name' },
      { label: 'avg_qty', key: 'avg_qty' },
    ],
  },
  region: {
    file: 'R3_ventas_por_ciudad_region.csv',
    headers: [
      { label: 'region', key: 'region' },
      { label: 'city', key: 'city' },
      { label: 'total_revenue', key: 'total_revenue' },
    ],
  },
  channel: {
    file: 'R4_ventas_por_canal.csv',
    headers: [
      { label: 'channel_name', key: 'channel_name' },
      { label: 'total_revenue', key: 'total_revenue' },
      { label: 'num_sales', key: 'num_sales' },
    ],
  },
  top: {
    file: 'R5_top5_productos.csv',
    headers: [
      { label: 'product_name', key: 'product_name' },
      { label: 'category', key: 'category' },
      { label: 'total_revenue', key: 'total_revenue' },
    ],
  },
};

export function exportAllCSVs({ monthly, avgQty, region, channel, top }) {
  const packs = [
    [CSV_DEFS.monthly, monthly],
    [CSV_DEFS.avgQty, avgQty],
    [CSV_DEFS.region, region],
    [CSV_DEFS.channel, channel],
    [CSV_DEFS.top, top],
  ];
  packs.forEach(([def, rows], i) => {
    setTimeout(() => downloadCSV(def.file, rows, def.headers), i * 350);
  });
}

/* ---------- PDF ---------- */

const money = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return '-';
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n);
};

export function exportPDF({ kpis, monthly, avgQty, region, channel, top }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = 0;

  // Header band
  doc.setFillColor(11, 18, 38);
  doc.rect(0, 0, W, 110, 'F');
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SDG 8  ·  TRABAJO DECENTE  ·  RETAIL COLOMBIA', 40, 28);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(19);
  doc.text('Dinamismo del retail como proxy', 40, 52);
  doc.text('de actividad economica y empleo', 40, 74);
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `ETL Python  ·  DW PostgreSQL  ·  API FastAPI  ·  React + Recharts   |   Generado: ${new Date().toLocaleString('es-CO')}`,
    40,
    94
  );
  y = 130;

  // KPIs
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Resumen ejecutivo', 40, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    head: [['Ingresos totales', 'N. ventas', 'Ciudad lider', 'Top producto', 'Canal top']],
    body: [
      [
        `$ ${money(kpis.totalRevenue)}`,
        money(kpis.totalSales),
        `${kpis.bestCity || '-'} ($ ${money(kpis.bestCityRev)})`,
        `${kpis.topProduct || '-'}`,
        `${kpis.topChannel || '-'} (${kpis.topChannelShare || '-'})`,
      ],
    ],
    styles: { fontSize: 8.5, cellPadding: 7 },
    headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 40, right: 40 },
  });
  y = doc.lastAutoTable.finalY + 22;

  const section = (title, head, body) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(title, 40, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [head],
      body,
      styles: { fontSize: 8.5, cellPadding: 5 },
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 40, right: 40 },
    });
    y = doc.lastAutoTable.finalY + 20;
  };

  section(
    'R1 · Ventas totales por mes',
    ['Periodo', 'Ano', 'Mes', 'Ingresos (COP)'],
    monthly.map((r) => [monthLabel(r.year, r.month), String(r.year), String(r.month), money(r.total_revenue)])
  );
  section(
    'R2 · Cantidad promedio por producto',
    ['Producto', 'Cantidad prom.'],
    avgQty.map((r) => [r.product_name, Number(r.avg_qty).toFixed(2)])
  );
  section(
    'R3 · Ventas por ciudad y region',
    ['Region', 'Ciudad', 'Ingresos (COP)'],
    region.map((r) => [r.region, r.city, money(r.total_revenue)])
  );
  section(
    'R4 · Ventas por canal',
    ['Canal', 'Ingresos (COP)', 'N. ventas'],
    channel.map((r) => [r.channel_name, money(r.total_revenue), money(r.num_sales)])
  );
  section(
    'R5 · Top 5 productos por ingreso',
    ['#', 'Producto', 'Categoria', 'Ingresos (COP)'],
    top.map((r, i) => [String(i + 1), r.product_name, r.category, money(r.total_revenue)])
  );

  // Footer on each page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`RetailCO · SDG 8 · ETL Workshop 2026-2 · UAO  —  pag. ${i}/${pages}`, 40, doc.internal.pageSize.getHeight() - 24);
  }

  doc.save('RetailCO_SDG8_reporte_R1-R5.pdf');
}
