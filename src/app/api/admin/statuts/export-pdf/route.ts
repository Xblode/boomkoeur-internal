import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import jsPDF from 'jspdf';

interface StatutSection {
  id: string;
  title: string;
  articles: { id: string; title: string; body: string }[];
}

interface StatutContent {
  sections: StatutSection[];
  legalSiege?: string;
  legalRna?: string;
  legalSiret?: string;
}

interface SignatureRow {
  user_id: string;
  signed_at: string | null;
  profiles: { first_name: string; last_name: string } | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statutId = searchParams.get('statut_id');
  const orgId = searchParams.get('org_id');

  if (!statutId || !orgId) {
    return NextResponse.json({ error: 'statut_id et org_id requis' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { data: isAdmin } = await supabase.rpc('is_org_admin', {
    uid: user.id,
    oid: orgId,
  });
  if (!isAdmin) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const { data: statut, error } = await supabase
    .from('association_statuts')
    .select('*')
    .eq('id', statutId)
    .single();

  if (error || !statut) {
    return NextResponse.json({ error: 'Statut introuvable' }, { status: 404 });
  }

  const { data: org } = await supabase
    .from('organisations')
    .select('name')
    .eq('id', orgId)
    .single();

  const { data: signaturesData } = await supabase
    .from('association_statut_signatures')
    .select('user_id, signed_at, profiles:user_id(first_name, last_name)')
    .eq('statut_version_id', statutId);

  const content = statut.content as StatutContent;
  const orgName = org?.name ?? 'Association';

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(height: number) {
    if (y + height > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUTS DE L\'ASSOCIATION', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(14);
  doc.text(orgName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Legal info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const legalLines: string[] = [];
  if (content.legalSiege) legalLines.push(`Siège social : ${content.legalSiege}`);
  if (content.legalRna) legalLines.push(`RNA : ${content.legalRna}`);
  if (content.legalSiret) legalLines.push(`SIRET : ${content.legalSiret}`);
  if (legalLines.length > 0) {
    doc.text(legalLines.join('  |  '), pageWidth / 2, y, { align: 'center' });
    y += 6;
  }

  if (statut.adopted_at) {
    doc.text(
      `Adoptés le ${new Date(statut.adopted_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} — Version ${statut.version_number}`,
      pageWidth / 2,
      y,
      { align: 'center' },
    );
    y += 6;
  }

  y += 4;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Sections & articles
  for (const section of content.sections) {
    checkPageBreak(16);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, margin, y);
    y += 8;

    for (const article of section.articles) {
      checkPageBreak(12);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(article.title, margin, y);
      y += 5;

      if (article.body) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(article.body, contentWidth);
        for (const line of lines) {
          checkPageBreak(5);
          doc.text(line, margin, y);
          y += 4.5;
        }
      }
      y += 3;
    }
    y += 4;
  }

  // Signatures section
  const signatures = (signaturesData ?? []) as unknown as SignatureRow[];
  if (signatures.length > 0) {
    checkPageBreak(20);
    y += 6;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURES', margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    for (const sig of signatures) {
      checkPageBreak(8);
      const profile = sig.profiles;
      const name = profile ? `${profile.first_name} ${profile.last_name}` : sig.user_id;
      const signedDate = sig.signed_at
        ? new Date(sig.signed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Non signé';
      doc.text(`${name} — ${signedDate}`, margin, y);
      y += 6;
    }
  }

  // Footer note
  checkPageBreak(20);
  y += 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Ce document est généré automatiquement. Les changements doivent être déclarés au greffe des associations dans les 3 mois.',
    pageWidth / 2,
    y,
    { align: 'center', maxWidth: contentWidth },
  );

  const pdfBuffer = doc.output('arraybuffer');

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="statuts-${orgName.toLowerCase().replace(/\s+/g, '-')}-v${statut.version_number}.pdf"`,
    },
  });
}
