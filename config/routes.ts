// Configuration centralisée des routes API
export const API_ROUTES = {
  // Authentification
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  
  // Utilisateurs
  USERS: {
    ALL: '/utilisateurs/all',
    GET: (id: number) => `/utilisateurs/${id}`,
    UPDATE: (id: number) => `/utilisateurs/${id}`,
    CHECK_PASSWORD: '/utilisateurs/check-password',
  },
  
  // Clients
  CLIENTS: {
    ADD: '/clients/add',
    PROFILE: (id: number) => `/clients/${id}/profile`,
    UPDATE_PROFILE: (id: number) => `/clients/${id}/profile`,
  },
  
  // Livreurs
  LIVREURS: {
    ADD: '/livreurs/add',
    PROFILE: (id: number) => `/livreurs/${id}/profile`,
    UPDATE_PROFILE: (id: number) => `/livreurs/${id}/profile`,
    LIVRAISONS: (id: number) => `/livreurs/${id}/livraisons`,
    AVAILABLE_LIVRAISONS: '/livreurs/livraisons/available',
    ACCEPT_LIVRAISON: (id: number, livraisonId: number) => `/livreurs/${id}/livraisons/${livraisonId}/accept`,
    UPDATE_STATUS: (id: number, livraisonId: number) => `/livreurs/${id}/livraisons/${livraisonId}/status`,
    STATS: (id: number) => `/livreurs/${id}/stats`,
    AVAILABILITY: (id: number) => `/livreurs/${id}/availability`,
  },
  
  // Annonces
  ANNONCES: {
    ALL: '/annonces/',
    CREATE: '/annonces/create',
    GET: (id: number) => `/annonces/${id}`,
    USER_ANNONCES: (userId: number) => `/annonces/user/${userId}`,
    UPDATE: (id: number) => `/annonces/${id}`,
    CREATE_LIVRAISON: (id: number) => `/annonces/${id}/livraisons`,
    SERVICES: (id: number) => `/annonces/${id}/services`,
  },
  
  // Livraisons
  LIVRAISONS: {
    GET: (id: number) => `/livraisons/${id}`,
    UPDATE: (id: number) => `/livraisons/${id}`,
    CLIENT_LIVRAISONS: (clientId: number) => `/livraisons/client/${clientId}`,
  },
  
  // Colis
  COLIS: {
    CREATE: '/colis/create',
    GET: (trackingNumber: string) => `/colis/${trackingNumber}`,
    LOCATION_HISTORY: (trackingNumber: string) => `/colis/${trackingNumber}/location-history`,
    UPDATE_LOCATION: (trackingNumber: string) => `/colis/${trackingNumber}/update-location`,
  },
  
  // Messages
  MESSAGES: {
    SEND: '/messages/',
    CONVERSATIONS: '/messages/conversations',
    HISTORY: (userId: number) => `/messages/history/${userId}`,
    MARK_READ: (messageId: number) => `/messages/${messageId}/read`,
  },
  
  // Tracking
  TRACKING: {
    LIVREUR_POSITIONS: (livreurId: number) => `/tracking/livreur/${livreurId}/positions`,
    LAST_POSITION: (livreurId: number) => `/tracking/livreur/${livreurId}/last-position`,
    LIVRAISON: (livraisonId: number) => `/tracking/livraison/${livraisonId}`,
    ACTIVE_LIVREURS: '/tracking/active-livreurs',
  },
  
  // Services
  SERVICES: {
    ALL: '/services/',
    CREATE: '/services/',
    GET: (id: number) => `/services/${id}`,
    UPDATE: (id: number) => `/services/${id}`,
    DELETE: (id: number) => `/services/${id}`,
  },
  
  // Réclamations
  COMPLAINTS: {
    ALL: '/complaints/',
    CREATE: '/complaints/',
    GET: (id: number) => `/complaints/${id}`,
    UPDATE: (id: number) => `/complaints/${id}`,
    DELETE: (id: number) => `/complaints/${id}`,
    USER_COMPLAINTS: (userId: number) => `/complaints/user/${userId}`,
  },
};