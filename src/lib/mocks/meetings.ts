import { Meeting, AgendaItem, AgendaDocument } from '@/types/meeting';

// Mock meetings data
export const mockMeetings: Meeting[] = [
  {
    id: 'meeting-001',
    title: 'Point Hebdomadaire Équipe',
    description: 'Point hebdomadaire de l\'équipe pour faire le suivi des projets en cours, valider le budget Q1 et planifier les prochaines échéances.',
    date: new Date('2026-02-03'),
    startTime: '10:00',
    endTime: '11:30',
    location: 'Salle de réunion A',
    participants: ['Alice Martin', 'Bob Dupont', 'Claire Dubois', 'David Lefebvre'],
    status: 'upcoming',
    agenda: [
      {
        id: 'agenda-001-1',
        order: 1,
        title: 'Tour de table - Avancement projets',
        description: 'Chaque membre de l\'équipe présente brièvement l\'avancement de ses projets en cours, les éventuels blocages et les prochaines étapes prévues.',
        duration: 20,
        responsible: 'Alice Martin',
        documents: [],
        requiresVote: false,
      },
      {
        id: 'agenda-001-2',
        order: 2,
        title: 'Budget Q1 2026 - Validation',
        description: 'Présentation et validation du budget prévisionnel pour le premier trimestre 2026. Analyse des dépenses planifiées et des sources de financement.',
        duration: 30,
        responsible: 'Bob Dupont',
        documents: [
          { id: 'doc-001-2-1', name: 'budget_q1_2026.pdf', url: '' },
          { id: 'doc-001-2-2', name: 'previsions_finances.xlsx', url: '' },
        ] as AgendaDocument[],
        requiresVote: true,
        voteResult: 'pending',
      },
      {
        id: 'agenda-001-3',
        order: 3,
        title: 'Planning événements Février-Mars',
        description: 'Revue du calendrier des événements à venir sur février et mars. Discussion sur les ressources nécessaires et la répartition des tâches.',
        duration: 25,
        responsible: 'Claire Dubois',
        documents: [{ id: 'doc-001-3-1', name: 'calendrier_events.pdf', url: '' }] as AgendaDocument[],
        requiresVote: false,
      },
      {
        id: 'agenda-001-4',
        order: 4,
        title: 'Recrutement nouveau stagiaire',
        description: 'Discussion sur le profil recherché pour le poste de stagiaire en communication. Vote sur le lancement du processus de recrutement.',
        duration: 15,
        responsible: 'David Lefebvre',
        documents: [],
        requiresVote: true,
        voteResult: 'pending',
      },
    ],
    minutes: {
      freeText: '',
    },
    created_at: new Date('2026-01-27'),
    updated_at: new Date('2026-01-27'),
  },
  {
    id: 'meeting-002',
    title: 'Rétrospective Projet Boom Koeur',
    description: 'Rétrospective complète du projet Boom Koeur : bilan des réussites, points d\'amélioration et enseignements pour les prochains événements.',
    date: new Date('2026-01-29'),
    startTime: '14:00',
    endTime: '16:00',
    location: 'Visio - Zoom',
    participants: ['Alice Martin', 'Claire Dubois', 'Emma Rousseau', 'Franck Bernard'],
    status: 'completed',
    agenda: [
      {
        id: 'agenda-002-1',
        order: 1,
        title: 'Bilan global du projet',
        description: 'Présentation du bilan complet de l\'événement Boom Koeur : fréquentation, budget, retours des participants et partenaires.',
        duration: 30,
        responsible: 'Alice Martin',
        documents: [{ id: 'doc-002-1-1', name: 'bilan_boom_koeur.pdf', url: '' }] as AgendaDocument[],
        requiresVote: false,
        notes: 'Le projet s\'est bien déroulé dans l\'ensemble. Budget respecté à 95%. Quelques retards sur la communication.',
      },
      {
        id: 'agenda-002-2',
        order: 2,
        title: 'Points positifs / négatifs',
        description: 'Analyse collective des aspects réussis et des points à améliorer. Retour d\'expérience de chaque membre de l\'équipe organisatrice.',
        duration: 40,
        documents: [],
        requiresVote: false,
        notes: 'Positif: Excellente ambiance, bonne fréquentation (850 personnes). Négatif: Communication tardive, problèmes son début de soirée.',
      },
      {
        id: 'agenda-002-3',
        order: 3,
        title: 'Actions d\'amélioration pour le prochain événement',
        description: 'Définition des mesures concrètes à mettre en place pour éviter les problèmes rencontrés et optimiser l\'organisation future.',
        duration: 30,
        responsible: 'Claire Dubois',
        documents: [],
        requiresVote: false,
        notes: 'Prévoir test sono 1 semaine avant. Lancer la com 6 semaines avant (au lieu de 4). Budget com +20%.',
      },
      {
        id: 'agenda-002-4',
        order: 4,
        title: 'Validation du prochain événement - Mars 2026',
        description: 'Vote pour approuver la proposition d\'événement prévue pour le 21 mars 2026. Présentation du concept et du budget prévisionnel.',
        duration: 20,
        responsible: 'Emma Rousseau',
        documents: [{ id: 'doc-002-4-1', name: 'proposition_mars_2026.pdf', url: '' }] as AgendaDocument[],
        requiresVote: true,
        voteResult: 'approved',
        notes: 'Vote à l\'unanimité pour l\'événement du 21 mars 2026.',
      },
    ],
    minutes: {
      freeText: `# Rétrospective Boom Koeur - 29 janvier 2026

## Présents
Alice Martin, Claire Dubois, Emma Rousseau, Franck Bernard

## Résumé
Excellente rétrospective du projet Boom Koeur. Le bilan est globalement très positif avec 850 participants et un budget maîtrisé.

## Points clés
- Budget respecté à 95%
- Très bonne ambiance générale
- Quelques soucis techniques en début de soirée (résolus rapidement)
- Communication à améliorer pour le prochain événement

## Décisions prises
1. Anticiper les tests techniques (sono/lumière) 1 semaine avant au lieu de la veille
2. Lancer la communication 6 semaines avant (au lieu de 4)
3. Augmenter le budget communication de 20%
4. Validation unanime du prochain événement prévu le 21 mars 2026

## Actions
- Claire : Créer le calendrier de communication pour mars
- Emma : Réserver la salle et contacter les prestataires
- Franck : Établir le nouveau budget prévisionnel`,
      createdAt: new Date('2026-01-29T16:15:00'),
      updatedAt: new Date('2026-01-29T16:15:00'),
    },
    created_at: new Date('2026-01-22'),
    updated_at: new Date('2026-01-29T16:15:00'),
  },
  {
    id: 'meeting-003',
    title: 'Stratégie Communication 2026',
    description: 'Définition de la stratégie de communication pour l\'année 2026 : réseaux sociaux, événements, partenariats et budget.',
    date: new Date('2026-02-10'),
    startTime: '09:30',
    endTime: '12:00',
    location: 'Salle de réunion B',
    participants: ['Alice Martin', 'Claire Dubois', 'Sophie Martin', 'Thomas Moreau'],
    status: 'upcoming',
    agenda: [
      {
        id: 'agenda-003-1',
        order: 1,
        title: 'Bilan communication 2025',
        description: 'Analyse des performances de communication 2025 : statistiques des réseaux sociaux, taux d\'engagement, retombées presse et retour sur investissement.',
        duration: 30,
        responsible: 'Claire Dubois',
        documents: [
          { id: 'doc-003-1-1', name: 'bilan_com_2025.pdf', url: '' },
          { id: 'doc-003-1-2', name: 'analytics_2025.xlsx', url: '' },
        ] as AgendaDocument[],
        requiresVote: false,
      },
      {
        id: 'agenda-003-2',
        order: 2,
        title: 'Objectifs 2026',
        description: 'Définition des objectifs stratégiques de communication pour 2026 : croissance audience, notoriété, engagement communautaire.',
        duration: 40,
        responsible: 'Sophie Martin',
        documents: [{ id: 'doc-003-2-1', name: 'objectifs_2026.pdf', url: '' }] as AgendaDocument[],
        requiresVote: false,
      },
      {
        id: 'agenda-003-3',
        order: 3,
        title: 'Budget annuel communication',
        description: 'Présentation et vote du budget communication 2026. Répartition entre les différents canaux et actions prévues.',
        duration: 35,
        responsible: 'Alice Martin',
        documents: [{ id: 'doc-003-3-1', name: 'budget_com_2026.xlsx', url: '' }] as AgendaDocument[],
        requiresVote: true,
        voteResult: 'pending',
      },
      {
        id: 'agenda-003-4',
        order: 4,
        title: 'Nouveaux supports & canaux',
        description: 'Exploration de nouveaux canaux de communication (TikTok, newsletter, podcast) et présentation des supports visuels innovants.',
        duration: 30,
        responsible: 'Thomas Moreau',
        documents: [{ id: 'doc-003-4-1', name: 'nouveaux_supports.pdf', url: '' }] as AgendaDocument[],
        requiresVote: false,
      },
      {
        id: 'agenda-003-5',
        order: 5,
        title: 'Planning des campagnes',
        description: 'Calendrier détaillé des campagnes de communication 2026, avec dates clés, thématiques et responsabilités.',
        duration: 35,
        responsible: 'Claire Dubois',
        documents: [{ id: 'doc-003-5-1', name: 'planning_campagnes_2026.pdf', url: '' }] as AgendaDocument[],
        requiresVote: false,
      },
    ],
    minutes: {
      freeText: '',
    },
    created_at: new Date('2026-01-20'),
    updated_at: new Date('2026-01-20'),
  },
  {
    id: 'meeting-004',
    title: 'Onboarding Nouveau Membre',
    description: 'Session d\'accueil et d\'intégration du nouveau membre de l\'équipe. Présentation de l\'association, des outils et des processus internes.',
    date: new Date('2026-01-15'),
    startTime: '15:00',
    endTime: '16:00',
    location: 'Bureau',
    participants: ['Alice Martin', 'Lucas Petit'],
    status: 'completed',
    agenda: [
      {
        id: 'agenda-004-1',
        order: 1,
        title: 'Présentation de l\'association',
        description: 'Présentation des valeurs, de l\'histoire, des projets phares et de l\'organisation de l\'association Boom Koeur.',
        duration: 15,
        responsible: 'Alice Martin',
        documents: [{ id: 'doc-004-1-1', name: 'presentation_asso.pdf', url: '' }] as AgendaDocument[],
        requiresVote: false,
        notes: 'Présentation générale faite. Lucas très motivé.',
      },
      {
        id: 'agenda-004-2',
        order: 2,
        title: 'Tour des outils et accès',
        description: 'Configuration des accès aux différents outils de travail : email, messagerie, gestion de projets, stockage cloud.',
        duration: 20,
        responsible: 'Alice Martin',
        documents: [],
        requiresVote: false,
        notes: 'Accès créés: email, Slack, Trello, Drive. Mots de passe envoyés.',
      },
      {
        id: 'agenda-004-3',
        order: 3,
        title: 'Premières missions',
        description: 'Attribution des premières tâches et projets pour permettre une montée en compétence progressive et une intégration réussie.',
        duration: 15,
        responsible: 'Alice Martin',
        documents: [],
        requiresVote: false,
        notes: 'Lucas assigné sur la communication réseaux sociaux + aide préparation événement mars.',
      },
      {
        id: 'agenda-004-4',
        order: 4,
        title: 'Questions diverses',
        description: 'Moment d\'échange libre pour répondre aux questions du nouveau membre et clarifier les derniers points.',
        duration: 10,
        documents: [],
        requiresVote: false,
        notes: 'RAS. Prochain point dans 2 semaines.',
      },
    ],
    minutes: {
      freeText: `# Onboarding Lucas Petit - 15 janvier 2026

Lucas a été accueilli dans l'équipe. Présentation générale de l'association et de nos activités.

Accès fournis:
- Email: lucas.petit@boomkoeur.fr
- Slack
- Trello
- Google Drive

Premières missions:
1. Community management réseaux sociaux (Instagram + Facebook)
2. Aide préparation événement mars 2026

Prochain rendez-vous: 29 janvier pour point d'étape.`,
      createdAt: new Date('2026-01-15T16:10:00'),
      updatedAt: new Date('2026-01-15T16:10:00'),
    },
    created_at: new Date('2026-01-10'),
    updated_at: new Date('2026-01-15T16:10:00'),
  },
];
