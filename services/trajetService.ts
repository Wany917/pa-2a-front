import apiClient, { API_ROUTES } from '@/config/api';
import type { ApiResponse } from '@/types/api';

export interface TrajetPlanifie {
  id: number;
  livreurId: number;
  startingAddress: string;
  destinationAddress: string;
  plannedDate: string;
  description?: string;
  type: 'delivery_route' | 'shopping_trip' | 'other';
  status: 'active' | 'completed' | 'cancelled';
  maxCapacity?: number;
  estimatedDuration?: number;
  createdAt: string;
  updatedAt: string;
  livreur?: {
    id: number;
    availabilityStatus: 'available' | 'busy' | 'offline';
    rating?: number;
    totalDeliveries?: number;
    vehicleType?: string;
    vehicleNumber?: string;
  };
}

export interface CreateTrajetData {
  startingAddress: string;
  destinationAddress: string;
  plannedDate: string;
  description?: string;
  type?: 'delivery_route' | 'shopping_trip' | 'other';
  maxCapacity?: number;
  estimatedDuration?: number;
}

export interface TrajetFilters {
  startingAddress?: string;
  destinationAddress?: string;
  date?: string;
}

class TrajetService {
  /**
   * Créer un nouveau trajet planifié
   */
  async createTrajet(data: CreateTrajetData): Promise<ApiResponse<{ trajet: TrajetPlanifie }>> {
    return apiClient.post(API_ROUTES.TRAJETS.CREATE, data);
  }

  /**
   * Récupérer les trajets d'un livreur
   */
  async getTrajetsByLivreur(livreurId: number): Promise<ApiResponse<{ trajets: TrajetPlanifie[] }>> {
    return apiClient.get(API_ROUTES.TRAJETS.GET_BY_LIVREUR(livreurId));
  }

  /**
   * Récupérer les trajets actifs (pour les clients)
   */
  async getActiveTrajets(filters?: TrajetFilters): Promise<ApiResponse<{ trajets: TrajetPlanifie[] }>> {
    const params = new URLSearchParams();
    
    if (filters?.startingAddress) {
      params.append('startingAddress', filters.startingAddress);
    }
    if (filters?.destinationAddress) {
      params.append('destinationAddress', filters.destinationAddress);
    }
    if (filters?.date) {
      params.append('date', filters.date);
    }

    const queryString = params.toString();
    const url = queryString ? `${API_ROUTES.TRAJETS.GET_ACTIVE}?${queryString}` : API_ROUTES.TRAJETS.GET_ACTIVE;
    
    return apiClient.get(url);
  }

  /**
   * Mettre à jour un trajet
   */
  async updateTrajet(id: number, data: Partial<CreateTrajetData & { status: string }>): Promise<ApiResponse<{ trajet: TrajetPlanifie }>> {
    return apiClient.put(API_ROUTES.TRAJETS.UPDATE(id), data);
  }

  /**
   * Supprimer un trajet
   */
  async deleteTrajet(id: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(API_ROUTES.TRAJETS.DELETE(id));
  }

  /**
   * Marquer un trajet comme terminé
   */
  async completeTrajet(id: number): Promise<ApiResponse<{ trajet: TrajetPlanifie }>> {
    return this.updateTrajet(id, { status: 'completed' });
  }

  /**
   * Annuler un trajet
   */
  async cancelTrajet(id: number): Promise<ApiResponse<{ trajet: TrajetPlanifie }>> {
    return this.updateTrajet(id, { status: 'cancelled' });
  }
}

export const trajetService = new TrajetService();