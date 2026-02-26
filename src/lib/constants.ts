/**
 * Routes de l'application
 */
export const ROUTES = {
  // Frontend
  HOME: '/',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',

  // Backend
  DASHBOARD: '/dashboard',
  DEMO: '/demo',
  SETTINGS: '/dashboard/settings',
  ONBOARDING: '/onboarding',

  // Erreurs
  ERROR: '/error',
  NOT_FOUND: '/not-found',
  FORBIDDEN: '/forbidden',
  UNAUTHORIZED: '/unauthorized',
} as const;

/**
 * Messages d'erreur
 */
export const ERROR_MESSAGES = {
  GENERIC: 'Une erreur est survenue. Veuillez réessayer.',
  NOT_FOUND: 'La page que vous recherchez n\'existe pas.',
  FORBIDDEN: 'Vous n\'avez pas accès à cette ressource.',
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette page.',
  NETWORK: 'Erreur de connexion. Vérifiez votre connexion internet.',
  VALIDATION: 'Veuillez vérifier les informations saisies.',
} as const;

/**
 * Limites de l'application
 */
export const LIMITS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
  TEXT: {
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_BIO_LENGTH: 1000,
  },
} as const;

/**
 * Breakpoints Tailwind
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
