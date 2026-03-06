'use client';

import React, { useState, useRef } from 'react';
import { Modal, ModalFooter } from '@/components/ui/organisms';
import { Button, Label, Select } from '@/components/ui/atoms';
import { Loader2, Upload, Package, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { bulkCreateEventPosSales, deleteEventPosSalesByImportSource } from '@/lib/supabase/eventPos';
import type { EventPosProductWithVariants, EventPosVariant } from '@/types/eventPos';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ParsedRow {
  product: string;
  variant: string;
  quantity: number;
  amount: number;
  date: string;
  /** Heure extraite (HH:mm) si présente dans la date source */
  time: string | null;
  raw: string[];
}

/** Groupe les lignes par (produit + variante) et agrège quantité + montant */
interface GroupedCsvRow {
  product: string;
  variant: string;
  quantity: number;
  amount: number;
  date: string;
  rowIndices: number[];
}

type CsvFormat = 'articles' | 'ventes';

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, '').replace(/''/g, "'"));
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, '').replace(/''/g, "'"));
  return result;
}

/** Parse une date SumUp (ex: "27 sept. 2025 19:06") en YYYY-MM-DD et HH:mm */
function parseSumUpDateTime(dateStr: string): { date: string; time: string | null } {
  if (!dateStr || !dateStr.trim()) return { date: '', time: null };
  const m = dateStr.match(/(\d{1,2})\s+(janv|févr|mars|avr|mai|juin|juil|août|sept|oct|nov|déc)\.?\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/i);
  if (!m) return { date: '', time: null };
  const mois: Record<string, number> = {
    janv: 1, févr: 2, mars: 3, avr: 4, mai: 5, juin: 6,
    juil: 7, août: 8, sept: 9, oct: 10, nov: 11, déc: 12,
  };
  const moisNum = mois[m[2].toLowerCase()] ?? 0;
  if (!moisNum) return { date: '', time: null };
  const d = parseInt(m[1], 10);
  const y = parseInt(m[3], 10);
  const date = `${y}-${String(moisNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const time =
    m[4] != null && m[5] != null
      ? `${String(parseInt(m[4], 10)).padStart(2, '0')}:${String(parseInt(m[5], 10)).padStart(2, '0')}`
      : null;
  return { date, time };
}

/** Extrait variante (50cl, 25cl...) de la description pour le matching */
function extractVariantFromDescription(desc: string): { product: string; variant: string } {
  const match = desc.match(/\s+(25|33|50|75|100)\s*cl$/i);
  if (match) {
    const variant = `${match[1]}cl`;
    const product = desc.slice(0, -match[0].length).trim();
    return { product, variant };
  }
  return { product: desc, variant: '' };
}

function detectCsvFormat(header: string[]): CsvFormat {
  const h = header.map((x) => x.toLowerCase());
  const hasDesc = h.some((x) => x.includes('description'));
  const hasQty = h.some((x) => x.includes('quantit'));
  const hasPrixTTC = h.some((x) => x.includes('prix') && (x.includes('ttc') || x.includes('(ttc)')));
  if (hasDesc && hasQty && hasPrixTTC) return 'ventes';
  const hasArticle = h.some((x) => x.includes("nom de l'article") || x.includes('article'));
  if (hasArticle) return 'articles';
  return 'ventes';
}

/** Format Rapport articles : Nom article, Nom variante, Quantité, Montant */
function parseArticlesCsv(lines: string[], header: string[]): ParsedRow[] {
  const col = (names: string[]) =>
    header.findIndex((h) => names.some((n) => h.toLowerCase().includes(n) || n.includes(h.toLowerCase())));
  const productIdx = col(['produit', 'product', 'article', 'nom', 'name', "nom de l'article"]);
  const variantIdx = col(['variante', 'variant', 'nom de la variante']);
  const qtyIdx = col(['quantite', 'quantity', 'qty', 'nombre']);
  const amountIdx = col(['montant', 'amount', 'total', 'ventes', 'sum']);
  const dateIdx = col(['date', 'datum', 'timestamp']);

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const amount = amountIdx >= 0 ? parseFloat(String(cells[amountIdx] || '0').replace(',', '.')) : 0;
    if (Number.isNaN(amount) || amount <= 0) continue;
    const product = productIdx >= 0 ? String(cells[productIdx] || '').trim() : '';
    const variant = variantIdx >= 0 ? String(cells[variantIdx] || '').trim() : '';
    const quantity = qtyIdx >= 0 ? parseInt(String(cells[qtyIdx] || '1'), 10) || 1 : 1;
    const dateStr = dateIdx >= 0 ? cells[dateIdx] : '';
    const { date, time } = parseSumUpDateTime(dateStr);
    rows.push({ product, variant, quantity, amount, date: date || dateStr, time, raw: cells });
  }
  return rows;
}

/** Format Rapport ventes : Description, Quantité, Prix (TTC) — gère Happy Hour (prix déjà réduit) */
function parseVentesCsv(lines: string[], header: string[]): ParsedRow[] {
  const col = (names: string[]) =>
    header.findIndex((h) => names.some((n) => h.toLowerCase().includes(n) || n.includes(h.toLowerCase())));
  const descIdx = col(['description', 'article', 'nom']);
  const qtyIdx = col(['quantite', 'quantity', 'qty']);
  const prixTTCIdx = col(['prix (ttc)', 'prix ttc', 'montant', 'total']);
  const typeIdx = col(['type']);
  const dateIdx = col(['date', 'datum']);

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const type = typeIdx >= 0 ? String(cells[typeIdx] || '').trim().toLowerCase() : 'vente';
    if (type && type !== 'vente') continue; // ignorer Remboursement, etc.
    const amount = prixTTCIdx >= 0 ? parseFloat(String(cells[prixTTCIdx] || '0').replace(',', '.')) : 0;
    if (Number.isNaN(amount) || amount <= 0) continue;
    const description = descIdx >= 0 ? String(cells[descIdx] || '').trim() : '';
    if (!description) continue;
    const quantity = qtyIdx >= 0 ? parseInt(String(cells[qtyIdx] || '1'), 10) || 1 : 1;
    const dateStr = dateIdx >= 0 ? cells[dateIdx] : '';
    const { date, time } = parseSumUpDateTime(dateStr);
    const { product, variant } = extractVariantFromDescription(description);
    rows.push({
      product: product || description,
      variant,
      quantity,
      amount,
      date: date || dateStr,
      time,
      raw: cells,
    });
  }
  return rows;
}

function parseSalesCsv(text: string): { rows: ParsedRow[]; format: CsvFormat } {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], format: 'ventes' };
  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const format = detectCsvFormat(header.map((h) => h.toLowerCase()));
  const rows =
    format === 'ventes'
      ? parseVentesCsv(lines, header)
      : parseArticlesCsv(lines, header.map((h) => h.toLowerCase()));
  return { rows, format };
}

function groupParsedRows(rows: ParsedRow[]): GroupedCsvRow[] {
  const map = new Map<string, GroupedCsvRow>();
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const key = `${(r.product || '').toLowerCase()}|${(r.variant || '').toLowerCase()}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += r.quantity;
      existing.amount += r.amount;
      existing.rowIndices.push(i);
    } else {
      map.set(key, {
        product: r.product || '(sans nom)',
        variant: r.variant || '',
        quantity: r.quantity,
        amount: r.amount,
        date: r.date,
        rowIndices: [i],
      });
    }
  }
  return Array.from(map.values());
}

/** Trouve l'index du groupe contenant la ligne rowIndex */
function findGroupIndexForRow(grouped: GroupedCsvRow[], rowIndex: number): number {
  return grouped.findIndex((g) => g.rowIndices.includes(rowIndex));
}

function formatVariantLabel(v: EventPosVariant): string {
  const parts: string[] = [];
  if (v.size) parts.push(v.size);
  if (v.color) parts.push(v.color);
  if (v.design) parts.push(v.design);
  if (v.sale_unit_cl) parts.push(`${v.sale_unit_cl}cl`);
  return parts.length > 0 ? parts.join(' • ') : '—';
}

interface ImportSalesCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  products: EventPosProductWithVariants[];
  defaultDate: string;
  onSuccess: () => void;
}

export function ImportSalesCsvModal({
  isOpen,
  onClose,
  eventId,
  products,
  defaultDate,
  onSuccess,
}: ImportSalesCsvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [grouped, setGrouped] = useState<GroupedCsvRow[]>([]);
  const [mapping, setMapping] = useState<Record<number, { productId: string; variantId: string }>>({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [csvFormat, setCsvFormat] = useState<CsvFormat>('ventes');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const { rows, format } = parseSalesCsv(text);
        setParsed(rows);
        setCsvFormat(format);
        const g = groupParsedRows(rows);
        setGrouped(g);
        const initial: Record<number, { productId: string; variantId: string }> = {};
        g.forEach((grp, idx) => {
          const match = products.find((p) => {
            const nameMatch =
              p.name.toLowerCase() === grp.product.toLowerCase() ||
              grp.product.toLowerCase().includes(p.name.toLowerCase());
            if (!nameMatch) return false;
            if (p.variants.length === 1) return true;
            const vMatch = p.variants.find((v) => {
              const vLabel = formatVariantLabel(v).toLowerCase();
              const csvVar = grp.variant.toLowerCase();
              return vLabel.includes(csvVar) || csvVar.includes(vLabel) || (v.sale_unit_cl && `${v.sale_unit_cl}cl` === csvVar);
            });
            return !!vMatch;
          });
          if (match) {
            const variant = match.variants.find((v) => {
              const vLabel = formatVariantLabel(v).toLowerCase();
              const csvVar = grp.variant.toLowerCase();
              return vLabel.includes(csvVar) || csvVar.includes(vLabel) || (v.sale_unit_cl && `${v.sale_unit_cl}cl` === csvVar);
            }) ?? match.variants[0];
            if (variant) initial[idx] = { productId: match.id, variantId: variant.id };
          }
        });
        setMapping(initial);
      } catch {
        setParsed([]);
        setGrouped([]);
        setMapping({});
      }
    };
    reader.readAsText(f, 'UTF-8');
    e.target.value = '';
  };

  const handleImport = async () => {
    const dateStr = defaultDate.split('T')[0] || new Date().toISOString().slice(0, 10);
    const toCreate: Array<{
      event_pos_product_id: string;
      event_pos_variant_id: string | null;
      quantity: number;
      unit_price: number;
      total: number;
      payment_type: 'card';
      source: 'import_csv';
      reference: string | null;
      sale_date: string;
      sale_time: string | null;
    }> = [];

    for (let rowIdx = 0; rowIdx < parsed.length; rowIdx++) {
      const row = parsed[rowIdx];
      const grpIdx = findGroupIndexForRow(grouped, rowIdx);
      if (grpIdx < 0) continue;
      const map = mapping[grpIdx];
      if (!map) continue;
      const product = products.find((p) => p.id === map.productId);
      if (!product) continue;
      const variant = product.variants.find((v) => v.id === map.variantId);
      const variantId = variant?.id ?? product.variants[0]?.id ?? null;
      const unitPrice = row.quantity > 0 ? row.amount / row.quantity : row.amount;
      const saleDate = row.date || dateStr;
      toCreate.push({
        event_pos_product_id: map.productId,
        event_pos_variant_id: variantId,
        quantity: row.quantity,
        unit_price: unitPrice,
        total: row.amount,
        payment_type: 'card',
        source: 'import_csv',
        reference: null,
        sale_date: saleDate,
        sale_time: row.time,
      });
    }

    if (toCreate.length === 0) {
      toast.error('Aucune ligne mappée. Associez les produits du CSV à vos produits POS.');
      return;
    }

    setLoading(true);
    try {
      await deleteEventPosSalesByImportSource(eventId);
      await bulkCreateEventPosSales(eventId, toCreate);
      toast.success(`${toCreate.length} vente(s) importée(s)`);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    } finally {
      setLoading(false);
    }
  };

  const mappedCount = Object.keys(mapping).length;
  const hasValidMapping = mappedCount > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importer ventes CSV (SumUp)" size="xl">
      <div className="space-y-4">
        <div>
          <Label>Fichier CSV SumUp</Label>
          <p className="text-xs text-zinc-500 mb-2">
            <strong>Rapport ventes</strong> (recommandé) : Description, Quantité, Prix (TTC) — gère Happy Hour et prix réduits automatiquement.
            <br />
            <strong>Rapport articles</strong> : Nom de l&apos;article, Nom de la variante, Quantité, Montant.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} className="mr-1.5" />
            {file ? file.name : 'Choisir un fichier'}
          </Button>
        </div>

        {grouped.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border border-border-custom rounded-lg overflow-hidden">
            {/* Colonne gauche : Produits POS du site */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Package size={16} />
                Produits POS (site)
              </h3>
              <div className="max-h-72 overflow-y-auto space-y-1">
                {products.map((p) => (
                  <div key={p.id} className="space-y-0.5">
                    <div className="font-medium text-sm text-foreground">{p.name}</div>
                    {p.variants.map((v) => (
                      <div
                        key={v.id}
                        className="text-xs text-zinc-600 dark:text-zinc-400 pl-3 py-0.5"
                      >
                        {formatVariantLabel(v)} — {v.price} €
                      </div>
                    ))}
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-sm text-zinc-500">Aucun produit configuré.</p>
                )}
              </div>
            </div>

            {/* Colonne droite : Données CSV parsées */}
            <div className="p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <FileSpreadsheet size={16} />
                Données CSV ({grouped.length} ligne(s) regroupées)
                {csvFormat === 'ventes' && (
                  <span className="text-xs font-normal text-zinc-500">(Rapport ventes • Happy Hour inclus)</span>
                )}
              </h3>
              <div className="max-h-72 overflow-y-auto space-y-2">
                {grouped.map((grp, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex flex-col gap-2 p-2 rounded-md border transition-colors',
                      mapping[i]
                        ? 'border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10'
                        : 'border-border-custom'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                          {grp.product}
                          {grp.variant && (
                            <span className="text-zinc-500 font-normal"> — {grp.variant}</span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500 tabular-nums">
                          {grp.quantity} × {(grp.quantity > 0 ? grp.amount / grp.quantity : grp.amount).toFixed(2)} € = {grp.amount.toFixed(2)} €
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <ArrowRight size={14} className="text-zinc-400" />
                        <Select
                          value={mapping[i] ? `${mapping[i].productId}:${mapping[i].variantId}` : ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (!v) {
                              setMapping((m) => {
                                const next = { ...m };
                                delete next[i];
                                return next;
                              });
                              return;
                            }
                            const [productId, variantId] = v.split(':');
                            setMapping((m) => ({ ...m, [i]: { productId, variantId } }));
                          }}
                          className="min-w-[140px] text-xs"
                        >
                          <option value="">— Lier à un produit</option>
                          {products.flatMap((p) =>
                            p.variants.length > 0
                              ? p.variants.map((v) => (
                                  <option
                                    key={`${p.id}-${v.id}`}
                                    value={`${p.id}:${v.id}`}
                                  >
                                    {p.name} — {formatVariantLabel(v)}
                                  </option>
                                ))
                              : [
                                  <option key={p.id} value={`${p.id}:`}>
                                    {p.name}
                                  </option>,
                                ]
                          )}
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {mappedCount} / {grouped.length} ligne(s) liées
              </p>
            </div>
          </div>
        )}
      </div>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleImport}
          disabled={loading || !hasValidMapping}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin mr-1.5" />
              Import...
            </>
          ) : (
            `Importer ${mappedCount} ligne(s)`
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
