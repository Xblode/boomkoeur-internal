/**
 * Génération du PDF Bilan Campagne marketing.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Event, ComWorkflowPost } from '@/types/event';
import type { ShotgunTicket } from '@/types/shotgun';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InstagramPostStats {
  postName: string;
  type?: string;
  reach?: number;
  impressions?: number;
  likes?: number;
  comments?: number;
  engagement?: number;
  saved?: number;
  shares?: number;
  views?: number;
}

interface BilanPdfData {
  event: Event;
  bilanNotes?: string;
  instagramAccount?: { username?: string; followers_count?: number };
  instagramReach?: number;
  instagramInsights?: { reach?: number; impressions?: number };
  followersAtStart?: number;
  postsWithStats?: InstagramPostStats[];
  shotgunTickets?: ShotgunTicket[];
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatEur(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

export function generateBilanPdf(data: BilanPdfData): Buffer {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  const { event, bilanNotes, instagramAccount, instagramReach, instagramInsights, followersAtStart, postsWithStats, shotgunTickets } = data;

  const eventDate = event.date ? format(new Date(event.date), 'EEEE d MMMM yyyy', { locale: fr }) : '-';

  // En-tête
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bilan Campagne Marketing', margin, y);
  y += 8;
  pdf.setFontSize(14);
  pdf.text(event.name, margin, y);
  y += 6;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${eventDate} · ${event.location || '-'}`, margin, y);
  pdf.text(`Date d'édition: ${format(new Date(), 'd MMMM yyyy', { locale: fr })}`, pageWidth - margin, y, { align: 'right' });
  y += 15;

  // Bilan campagne (posts)
  const posts = event.comWorkflow?.posts ?? [];
  const publishedCount = posts.filter((p) => p.published).length;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Campagne', margin, y);
  y += 6;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${publishedCount} / ${posts.length} posts publiés`, margin, y);
  y += 8;

  if (posts.length > 0) {
    const postRows = posts.map((p) => [
      p.name ?? '-',
      p.type ?? '-',
      p.scheduledDate ? format(new Date(p.scheduledDate), 'd MMM yyyy', { locale: fr }) : '-',
      p.published ? 'Oui' : 'Non',
    ]);
    autoTable(pdf, {
      head: [['Post', 'Type', 'Date', 'Publié']],
      body: postRows,
      startY: y,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 40, 40], textColor: 255 },
      margin: { left: margin, right: margin },
    });
    y = (pdf as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y;
    y += 12;
  }

  // Bilan Instagram
  if (instagramAccount || instagramReach !== undefined || (postsWithStats && postsWithStats.length > 0)) {
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Instagram', margin, y);
    y += 6;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (instagramAccount?.username) {
      pdf.text(`Compte: @${instagramAccount.username}`, margin, y);
      y += 5;
    }
    if (followersAtStart != null) {
      pdf.text(`Abonnés au démarrage: ${formatNumber(followersAtStart)}`, margin, y);
      y += 5;
    }
    if (instagramAccount?.followers_count != null) {
      pdf.text(`Abonnés actuels: ${formatNumber(instagramAccount.followers_count)}`, margin, y);
      y += 5;
    }
    const reach = instagramReach ?? instagramInsights?.reach ?? instagramInsights?.impressions;
    if (reach != null && reach > 0) {
      pdf.text(`Portée 7j: ${formatNumber(reach)}`, margin, y);
      y += 5;
    }
    y += 5;

    if (postsWithStats && postsWithStats.length > 0) {
      const statsRows = postsWithStats.map((p) => [
        p.postName,
        p.type ?? '-',
        p.reach != null ? formatNumber(p.reach) : '-',
        p.impressions != null ? formatNumber(p.impressions) : '-',
        p.likes != null ? formatNumber(p.likes) : '-',
        p.comments != null ? formatNumber(p.comments) : '-',
        p.engagement != null ? formatNumber(p.engagement) : '-',
      ]);
      autoTable(pdf, {
        head: [['Post', 'Type', 'Portée', 'Impressions', 'Likes', 'Commentaires', 'Engagement']],
        body: statsRows,
        startY: y,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        margin: { left: margin, right: margin },
      });
      y = (pdf as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y;
      y += 12;
    }
  }

  // Bilan Shotgun (ventes)
  if (shotgunTickets && shotgunTickets.length > 0) {
    if (y > 240) {
      pdf.addPage();
      y = 20;
    }
    const valid = shotgunTickets.filter((t) => t.ticket_status === 'valid');
    const totalRevenue = valid.reduce((sum, t) => sum + t.deal_price, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Billetterie (Shotgun)', margin, y);
    y += 6;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${valid.length} billets vendus · ${formatEur(totalRevenue)}`, margin, y);
    y += 12;

    const dealMap = new Map<string, { count: number; revenue: number }>();
    valid.forEach((t) => {
      const entry = dealMap.get(t.deal_title) ?? { count: 0, revenue: 0 };
      entry.count += 1;
      entry.revenue += t.deal_price;
      dealMap.set(t.deal_title, entry);
    });
    const dealRows = Array.from(dealMap.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([title, v]) => [title, String(v.count), formatEur(v.revenue)]);
    if (dealRows.length > 0) {
      autoTable(pdf, {
        head: [['Offre', 'Quantité', 'CA']],
        body: dealRows,
        startY: y,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        margin: { left: margin, right: margin },
      });
      y = (pdf as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y;
      y += 12;
    }
  }

  // Notes / Enseignements
  if (bilanNotes?.trim()) {
    if (y > 230) {
      pdf.addPage();
      y = 20;
    }
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notes / Enseignements', margin, y);
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(bilanNotes.trim(), pageWidth - 2 * margin);
    pdf.text(lines, margin, y);
  }

  return Buffer.from(pdf.output('arraybuffer'));
}
