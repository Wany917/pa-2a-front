// Fonctions d'utilitaires pour le formatage des dates

/**
 * Formate une date en format lisible
 */
export const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) return 'N/A';
  
  // Formatter en format local: jour mois, année
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Formate l'heure au format hh:mm
 */
export const formatTime = (dateString?: string | Date): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) return 'N/A';
  
  // Formatter en format hh:mm
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate une plage de dates (pour les annonces)
 */
export const formatDateRange = (dateString?: string | Date): string => {
  if (!dateString) return 'Date non spécifiée';
  
  const date = new Date(dateString);
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) return 'Date non spécifiée';
  
  // Date de début (date fournie)
  const startDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long'
  });
  
  // Date de fin (date + 14 jours)
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 14);
  const endDateFormatted = endDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long'
  });
  
  return `${startDate} - ${endDateFormatted}`;
};

const getMonthName = (date: Date): string => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  return months[date.getMonth()];
};