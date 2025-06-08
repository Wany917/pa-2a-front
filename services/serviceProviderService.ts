import apiClient, { API_ROUTES } from '@/config/api';
import type { Prestataire, Message, ApiResponse, User } from '@/types/api';

interface MultiRoleUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  prestataire?: { id: number; service_type?: string; availability_status: string; };
}

class ServiceProviderService {
  private async getServiceProviderId(): Promise<number> {
    const userResponse = await apiClient.get<MultiRoleUser>(API_ROUTES.AUTH.ME);
    if (!userResponse.data.prestataire?.id) {
      throw new Error('Unauthorized: service provider role required');
    }
    return userResponse.data.prestataire.id;
  }

  async getProfile(): Promise<ApiResponse<Prestataire>> {
    const id = await this.getServiceProviderId();
    return apiClient.get(API_ROUTES.PRESTATAIRES.GET(id));
  }

  async updateProfile(data: Partial<Prestataire>): Promise<ApiResponse<Prestataire>> {
    const id = await this.getServiceProviderId();
    return apiClient.put(API_ROUTES.PRESTATAIRES.UPDATE(id), data);
  }

  async getMyInterventions(filters?: any): Promise<ApiResponse<any[]>> {
    const id = await this.getServiceProviderId();
    return apiClient.get(API_ROUTES.PRESTATAIRES.INTERVENTIONS(id), { params: filters });
  }

  async updateAvailability(status: string): Promise<ApiResponse<Prestataire>> {
    const id = await this.getServiceProviderId();
    return apiClient.put(API_ROUTES.PRESTATAIRES.UPDATE_AVAILABILITY(id), { status });
  }

  async getConversations(): Promise<ApiResponse<any[]>> {
    const userResponse = await apiClient.get<User>(API_ROUTES.AUTH.ME);
    return apiClient.get(API_ROUTES.MESSAGES.USER_CONVERSATIONS(userResponse.data.id));
  }

  async sendMessage(data: any): Promise<ApiResponse<Message>> {
    return apiClient.post(API_ROUTES.MESSAGES.SEND, data);
  }

  async getStats(): Promise<ApiResponse<any>> {
    const id = await this.getServiceProviderId();
    return apiClient.get(API_ROUTES.PRESTATAIRES.STATS(id));
  }
}

export const serviceProviderService = new ServiceProviderService();