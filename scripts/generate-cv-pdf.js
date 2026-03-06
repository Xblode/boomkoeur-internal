#!/usr/bin/env node
/**
 * Génère un CV PDF compatible ATS avec mise en page brute.
 * Utilise la logique des composants UI (Badge, bloc Profil) sans aspect "web".
 * Sortie : docs/CV_Paul_Monville.pdf
 */

const { jsPDF } = require('jspdf');
const path = require('path');
const fs = require('fs');

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

function drawTriangle(pdf, x, y, size = 2.5) {
  // Triangle rectangle : angle droit en haut à droite, hypoténuse de haut-gauche vers bas-droite
  pdf.setFillColor(0, 0, 0);
  pdf.triangle(x, y, x + size, y, x + size, y + size, 'F');
}

function drawSectionTitle(pdf, text, y) {
  const triangleSize = 2.5;
  const gap = 2;
  const titleX = MARGIN + triangleSize + gap;
  drawTriangle(pdf, MARGIN, y - 1.5, triangleSize);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text(text, titleX, y + 1);
  return y + 6;
}

function drawBadge(pdf, text, x, y) {
  // Style Badge secondary (theme light) : fond gris clair, texte foncé
  const paddingH = 4;
  const paddingV = 1.5;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const textWidth = pdf.getTextWidth(text);
  const badgeW = textWidth + 2 * paddingH;
  const badgeH = 5;
  pdf.setFillColor(230, 230, 230);
  pdf.roundedRect(x, y - badgeH + 1, badgeW, badgeH, 2, 2, 'F');
  pdf.setTextColor(55, 65, 81);
  pdf.text(text, x + paddingH, y);
  return badgeW + 3;
}

function main() {
  const pdf = new jsPDF('p', 'mm', 'a4');
  let y = 15;

  // ========== EN-TÊTE ==========
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('PAUL MONVILLE', MARGIN, y);
  y += 7;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.text('Le Havre, France  |  paul.monville76@gmail.com  |  Permis B  |  07 49 03 58 50', MARGIN, y);
  y += 12;

  // ========== BLOC PROFIL (fond noir) ==========
  const profilTitleY = y;
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, y - 4, PAGE_WIDTH, 45, 'F');
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('PROFIL PROFESSIONNEL', MARGIN, y + 5);
  y += 10;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(255, 255, 255);
  const profilText = `Professionnel de santé expérimenté avec 10 ans de pratique en environnements techniques exigeants et sécuritaires, habitué au travail en horaires postés (3x8, nuits, week-ends) et à la gestion des situations critiques. Solide culture des procédures, de la surveillance de paramètres et de la traçabilité, avec un engagement fort pour la sécurité et la continuité de service.`;
  const profilLines = pdf.splitTextToSize(profilText, PAGE_WIDTH - 2 * MARGIN);
  pdf.text(profilLines, MARGIN, y);
  y += profilLines.length * 5 + 8;

  // ========== COMPÉTENCES ==========
  y = drawSectionTitle(pdf, 'COMPÉTENCES', y);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  const competences = [
    'Culture sécurité : Respect strict des protocoles et standards sécurité, Travail en environnement à risques, Gestion des situations d\'urgence, Prévention des risques',
    'Terrain et technique : Utilisation d\'équipements techniques, Manutention et ergonomie, Lecture et saisie de données informatiques (logiciel type Sillage)',
    'Exploitation et production : Travail en horaires postés (3x8, nuits, week-ends), Transmission des consignes d\'exploitation, Continuité de service, Rigueur opérationnelle',
    'Conduite et surveillance d\'installations : Surveillance continue de paramètres de fonctionnement, Détection et signalement des anomalies, Application de procédures d\'exploitation, Réactivité en situation dégradée',
    'Langues : Français (Natif), Anglais (Niveau correct opérationnel)',
  ];
  competences.forEach((line) => {
    const lines = pdf.splitTextToSize(line, CONTENT_WIDTH - 4);
    pdf.text(lines, MARGIN + 4, y);
    y += lines.length * 5 + 2;
  });
  y += 4;

  // ========== EXPÉRIENCE PROFESSIONNELLE ==========
  y = drawSectionTitle(pdf, 'EXPÉRIENCE PROFESSIONNELLE', y);

  y += 2;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Aide-soignant - Centres hospitaliers / EHPAD / Soins à domicile', MARGIN, y);
  y += 5;

  let badgeX = MARGIN;
  badgeX += drawBadge(pdf, '2017 - 2026', badgeX, y);
  y += 8;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const expItems = [
    'Application stricte de procédures et protocoles techniques en environnement à risque',
    'Surveillance continue de paramètres et détection des dérives',
    'Gestion simultanée de 24 patients en garantissant la qualité et la continuité de service',
    'Travail en équipe et en autonomie selon l\'organisation',
    'Gestion de situations d\'urgence nécessitant sang froid et réactivité',
    'Traçabilité systématique des opérations sur logiciel dédié',
    'Travail en horaires postés : 3x8, 12h, nuits, week-ends, jours fériés',
  ];
  expItems.forEach((item) => {
    pdf.text('• ', MARGIN, y);
    const lines = pdf.splitTextToSize(item, CONTENT_WIDTH - 6);
    pdf.text(lines, MARGIN + 4, y);
    y += lines.length * 5 + 2;
  });
  y += 8;

  // ========== ÉDUCATION ==========
  y = drawSectionTitle(pdf, 'ÉDUCATION', y);

  y += 2;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FORMATION EN SOINS INFIRMIERS', MARGIN, y);
  y += 4;
  badgeX = MARGIN;
  badgeX += drawBadge(pdf, '2016 - 2019', badgeX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text('IFP Mary Thieullent', badgeX + 2, y);
  y += 7;

  pdf.setFont('helvetica', 'bold');
  pdf.text('DIPLÔME D\'ÉTAT AIDE SOIGNANT', MARGIN, y);
  y += 4;
  badgeX = MARGIN;
  badgeX += drawBadge(pdf, '2017', badgeX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text('IFP Mary Thieullent', badgeX + 2, y);
  y += 7;

  pdf.setFont('helvetica', 'bold');
  pdf.text('BACCALAURÉAT SCIENTIFIQUE', MARGIN, y);
  y += 4;
  badgeX = MARGIN;
  badgeX += drawBadge(pdf, '2015', badgeX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Lycée Jean Prévost', badgeX + 2, y);
  y += 10;

  // ========== FORMATION SÉCURITÉ ==========
  y = drawSectionTitle(pdf, 'FORMATION SÉCURITÉ', y);

  y += 2;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const formations = [
    'AFGSU 2 (Recyclage 2024)',
    'Incendie en milieu hospitalier',
    'Gestes et postures / ergonomie',
  ];
  formations.forEach((f) => {
    pdf.text('• ', MARGIN, y);
    pdf.text(f, MARGIN + 4, y);
    y += 5;
  });
  y += 6;

  // ========== INFORMATIONS COMPLÉMENTAIRES ==========
  y = drawSectionTitle(pdf, 'INFORMATIONS COMPLÉMENTAIRES', y);

  y += 2;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const infos = [
    'Voyages linguistiques (Australie, Indonésie, Japon, Hongrie)',
    'Football depuis l\'âge de 4 ans',
    'Rôle majeur dans une association de musique techno',
  ];
  infos.forEach((item) => {
    pdf.text('• ', MARGIN, y);
    pdf.text(item, MARGIN + 4, y);
    y += 5;
  });

  // Sauvegarde (Node.js : output + writeFileSync)
  const outputPath = path.resolve(process.cwd(), 'docs', 'CV_Paul_Monville.pdf');
  const docsDir = path.dirname(outputPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  const buffer = Buffer.from(pdf.output('arraybuffer'));
  fs.writeFileSync(outputPath, buffer);
  console.log(`CV généré : ${outputPath}`);
}

main();
