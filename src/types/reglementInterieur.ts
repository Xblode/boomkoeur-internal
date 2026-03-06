// Types pour le Règlement intérieur de l'association

export interface ReglementArticle {
  id: string;
  title: string;
  body: string;
}

export interface ReglementSection {
  id: string;
  title: string;
  articles: ReglementArticle[];
}

export interface ReglementInterieurContent {
  sections: ReglementSection[];
}

export interface ReglementInterieur {
  id: string;
  orgId: string;
  content: ReglementInterieurContent;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Template par défaut pour le règlement intérieur */
export const DEFAULT_REGLEMENT_CONTENT: ReglementInterieurContent = {
  sections: [
    {
      id: 'titre-1',
      title: 'Titre I - Objet et champ d\'application',
      articles: [
        { id: 'art-1', title: 'Article 1 - Objet', body: '' },
        { id: 'art-2', title: 'Article 2 - Champ d\'application', body: '' },
      ],
    },
    {
      id: 'titre-2',
      title: 'Titre II - Fonctionnement interne',
      articles: [
        { id: 'art-3', title: 'Article 3 - Réunions', body: '' },
        { id: 'art-4', title: 'Article 4 - Participation', body: '' },
      ],
    },
    {
      id: 'titre-3',
      title: 'Titre III - Droits et devoirs des membres',
      articles: [
        { id: 'art-5', title: 'Article 5 - Droits', body: '' },
        { id: 'art-6', title: 'Article 6 - Devoirs', body: '' },
      ],
    },
  ],
};
