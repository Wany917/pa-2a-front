// Configuration centralisée des routes API
export const API_ROUTES = {
  // Authentification
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    UPDATE_PROFILE: '/auth/update-profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // Utilisateurs
  USERS: {
    ALL: '/utilisateurs/all',
    GET: (id: number) => `/utilisateurs/${id}`,
    UPDATE: (id: number) => `/utilisateurs/${id}`,
    CHECK_PASSWORD: '/utilisateurs/check-password',
    PAYMENTS: (userId: number) => `/utilisateurs/${userId}/payments`,
    PROCESS_PAYMENT: '/utilisateurs/process-payment',
    UPLOAD_FILE: '/utilisateurs/upload-file',
    SEND_EMAIL: '/utilisateurs/send-email',
  },
  
  // Clients
  CLIENTS: {
    ADD: '/clients/add',
    PROFILE: (id: number) => `/clients/${id}/profile`,
    UPDATE_PROFILE: (id: number) => `/clients/${id}/profile`,
    STATS: (userId: number) => `/clients/stats/${userId}`,
  },
  
  // Livreurs
  LIVREURS: {
    ADD: '/livreurs/add',
    PROFILE: (id: number) => `/livreurs/${id}/profile`,
    UPDATE_PROFILE: (id: number) => `/livreurs/${id}/profile`,
    LIVRAISONS: (id: number) => `/livreurs/${id}/livraisons`,
    CURRENT_LIVRAISON: (id: number) => `/livreurs/${id}/current-livraison`,
    AVAILABLE_LIVRAISONS: '/livreurs/livraisons/available',
    ACCEPT_LIVRAISON: (id: number, livraisonId: number) => `/livreurs/${id}/livraisons/${livraisonId}/accept`,
    UPDATE_STATUS: (id: number, livraisonId: number) => `/livreurs/${id}/livraisons/${livraisonId}/status`,
    STATS: (id: number) => `/livreurs/${id}/stats`,
    AVAILABILITY: (id: number) => `/livreurs/${id}/availability`,
    UPLOAD_JUSTIFICATION: '/livreurs/upload-justification',
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
    CANCEL: (id: number) => `/livraisons/${id}/cancel`,
    RATE_LIVREUR: (livraisonId: number) => `/livraisons/${livraisonId}/rate-livreur`,
  },
  
  // Colis
  COLIS: {
    CREATE: '/colis/create',
    GET: (trackingNumber: string) => `/colis/${trackingNumber}`,
    USER_COLIS: (userId: number) => `/colis/user/${userId}`,
    TRACK: (trackingNumber: string) => `/colis/track/${trackingNumber}`,
    LOCATION_HISTORY: (trackingNumber: string) => `/colis/${trackingNumber}/location-history`,
    UPDATE_LOCATION: (id: number) => `/colis/${id}/update-location`,
  },
  
  // Messages
  MESSAGES: {
    SEND: '/messages/',
    CONVERSATIONS: '/messages/conversations',
    USER_CONVERSATIONS: (userId: number) => `/messages/conversations/${userId}`,
    HISTORY: (userId: number) => `/messages/history/${userId}`,
    MARK_READ: (messageId: number) => `/messages/${messageId}/read`,
  },
  
  // Tracking
  TRACKING: {
    LIVREUR_POSITIONS: (livreurId: number) => `/tracking/livreur/${livreurId}/positions`,
    LAST_POSITION: (livreurId: number) => `/tracking/livreur/${livreurId}/last-position`,
    LIVRAISON: (livraisonId: number) => `/tracking/livraison/${livraisonId}`,
    ACTIVE_LIVREURS: '/tracking/active-livreurs',
    UPDATE_LOCATION: '/tracking/update-location',
  },
  
  // Services
  SERVICES: {
    ALL: '/services/',
    CREATE: '/services/',
    GET: (id: number) => `/services/${id}`,
    UPDATE: (id: number) => `/services/${id}`,
    DELETE: (id: number) => `/services/${id}`,
    BOOK: (serviceId: number) => `/services/${serviceId}/book`,
    RATE: (serviceBookingId: number) => `/services/bookings/${serviceBookingId}/rate`,
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

  // Commerçants
  COMMERCANTS: {
    GET: (id: number) => `/commercants/${id}`,
    UPDATE: (id: number) => `/commercants/${id}`,
    STATS: (id: number) => `/commercants/${id}/stats`,
  },

  // Prestataires
  PRESTATAIRES: {
    GET: (id: number) => `/prestataires/${id}`,
    UPDATE: (id: number) => `/prestataires/${id}`,
    INTERVENTIONS: (id: number) => `/prestataires/${id}/interventions`,
    UPDATE_AVAILABILITY: (id: number) => `/prestataires/${id}/availability`,
    STATS: (id: number) => `/prestataires/${id}/stats`,
  },

  // Trajets
  TRAJETS: {
    CREATE: '/trajets/create',
  },
};