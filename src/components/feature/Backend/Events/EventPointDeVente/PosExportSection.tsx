'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import { Loader2, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  getEventPosProducts,
  getEventPosSales,
  getEventPosCashTotal,
} from '@/lib/supabase/eventPos';
import type { EventPosProductWithVariants, EventPosVariant } from '@/types/eventPos';

interface ExportRow {
  product: string;
  variant: string;
  stockInitial: number;
  ventesCb: number;
  ventesCashEst: number;
  pertes: number;
  stockFinal: number;
}

function formatVariantLabel(v: EventPosVariant): string {
  const parts: string[] = [];
  if (v.size) parts.push(v.size);
  if (v.color) parts.push(v.color);
  if (v.container_type) parts.push(v.container_type);
  if (v.sale_unit_cl) parts.push(`${v.sale_unit_cl}cl`);
  return parts.length > 0 ? parts.join(' • ') : '—';
}

function buildExportData(
  products: EventPosProductWithVariants[],
  sales: { event_pos_variant_id: string | null; quantity: number; total: number; payment_type: string }[],
  cashTotal: number
): ExportRow[] {
  const salesByVariant: Record<string, { cardAmount: number; cardQty: number }> = {};
  let totalCardAmount = 0;

  for (const s of sales) {
    if (s.payment_type !== 'card') continue;
    const vid = s.event_pos_variant_id ?? 'none';
    if (!salesByVariant[vid]) salesByVariant[vid] = { cardAmount: 0, cardQty: 0 };
    salesByVariant[vid].cardAmount += s.total;
    salesByVariant[vid].cardQty += s.quantity;
    totalCardAmount += s.total;
  }

  const rows: ExportRow[] = [];
  for (const p of products) {
    for (const v of p.variants) {
      const { cardAmount, cardQty } = salesByVariant[v.id] ?? { cardAmount: 0, cardQty: 0 };
      const partCashAmount = totalCardAmount > 0 ? (cashTotal * cardAmount) / totalCardAmount : 0;
      const unitPrice = v.price ?? 1;
      const partCashQty = unitPrice > 0 ? partCashAmount / unitPrice : 0;
      const stockInit = v.stock_initial ?? 0;
      const stockFin = v.stock_final ?? 0;
      const pertes = Math.max(0, stockInit - cardQty - partCashQty - stockFin);

      rows.push({
        product: p.name,
        variant: formatVariantLabel(v),
        stockInitial: stockInit,
        ventesCb: cardAmount,
        ventesCashEst: partCashAmount,
        pertes,
        stockFinal: stockFin,
      });
    }
  }
  return rows;
}

function exportCsv(rows: ExportRow[]): string {
  const headers = ['Produit', 'Variante', 'Stock initial', 'Ventes CB', 'Ventes cash (estimé)', 'Pertes', 'Stock final'];
  const lines = [headers.join(';')];
  for (const r of rows) {
    lines.push(`${r.product};${r.variant};${r.stockInitial};${r.ventesCb.toFixed(2)};${r.ventesCashEst.toFixed(2)};${r.pertes.toFixed(2)};${r.stockFinal}`);
  }
  return lines.join('\n');
}

function exportPdf(rows: ExportRow[], eventName: string): void {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Bilan Point de Vente', 14, 20);
  doc.setFontSize(12);
  doc.text(eventName, 14, 28);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 34);

  autoTable(doc, {
    startY: 42,
    head: [['Produit', 'Variante', 'Stock init.', 'Ventes CB', 'Cash (est.)', 'Pertes', 'Stock fin.']],
    body: rows.map((r) => [
      r.product,
      r.variant,
      String(r.stockInitial),
      r.ventesCb.toFixed(2),
      r.ventesCashEst.toFixed(2),
      r.pertes.toFixed(2),
      String(r.stockFinal),
    ]),
  });

  const totalCb = rows.reduce((s, r) => s + r.ventesCb, 0);
  const totalCash = rows.reduce((s, r) => s + r.ventesCashEst, 0);
  const totalPertes = rows.reduce((s, r) => s + r.pertes, 0);
  const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 42;
  doc.setFontSize(10);
  doc.text(`Total CB: ${totalCb.toFixed(2)} €`, 14, y + 10);
  doc.text(`Total cash (estimé): ${totalCash.toFixed(2)} €`, 14, y + 16);
  doc.text(`Pertes estimées: ${totalPertes.toFixed(2)}`, 14, y + 22);

  doc.save(`pos-${eventName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

interface PosExportSectionProps {
  eventId: string;
  eventName: string;
  /** Affiche uniquement les boutons (pour la toolbar) */
  variant?: 'default' | 'toolbar';
}

export function PosExportSection({ eventId, eventName, variant = 'default' }: PosExportSectionProps) {
  const [loading, setLoading] = useState(false);

  const fetchExportData = useCallback(async () => {
    const [products, sales, cash] = await Promise.all([
      getEventPosProducts(eventId),
      getEventPosSales(eventId),
      getEventPosCashTotal(eventId),
    ]);
    return buildExportData(products, sales, cash?.total_amount ?? 0);
  }, [eventId]);

  const handleExportCsv = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchExportData();
      const csv = exportCsv(rows);
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pos-${eventName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [eventName, fetchExportData]);

  const handleExportPdf = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchExportData();
      exportPdf(rows, eventName);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [eventName, fetchExportData]);

  const buttons = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={loading}>
        {loading ? (
          <Loader2 size={14} className="animate-spin mr-1.5" />
        ) : (
          <FileSpreadsheet size={14} className="mr-1.5" />
        )}
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={loading}>
        <FileText size={14} className="mr-1.5" />
        Export PDF
      </Button>
    </div>
  );

  if (variant === 'toolbar') {
    return buttons;
  }

  return (
    <Card variant="outline">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Export</CardTitle>
        {buttons}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Exportez les ventes, pertes et stock restant en CSV ou PDF.
        </p>
      </CardContent>
    </Card>
  );
}
