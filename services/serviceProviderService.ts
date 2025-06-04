import apiClient from '@/config/api';
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
    const userResponse = await apiClient.get<MultiRoleUser>('/auth/me');
    if (!userResponse.data.prestataire?.id) {
      throw new Error('Unauthorized: service provider role required');
    }
    return userResponse.data.prestataire.id;
  }

  async getProfile(): Promise<ApiResponse<Prestataire>> {
    const id = await this.getServiceProviderId();
    return apiClient.get(`/prestataires/${id}`);
  }

  async updateProfile(data: Partial<Prestataire>): Promise<ApiResponse<Prestataire>> {
    const id = await this.getServiceProviderId();
    return apiClient.put(`/prestataires/${id}`, data);
  }

  async getMyInterventions(filters?: any): Promise<ApiResponse<any[]>> {
    const id = await this.getServiceProviderId();
    return apiClient.get(`/prestataires/${id}/interventions`, { params: filters });
  }

  async updateAvailability(status: string): Promise<ApiResponse<Prestataire>> {
    const id = await this.getServiceProviderId();
    return apiClient.put(`/prestataires/${id}/availability`, { status });
  }

  async getConversations(): Promise<ApiResponse<any[]>> {
    const userResponse = await apiClient.get<User>('/auth/me');
    return apiClient.get(`/messages/conversations/${userResponse.data.id}`);
  }

  async sendMessage(data: any): Promise<ApiResponse<Message>> {
    return apiClient.post('/messages/send', data);
  }

  async getStats(): Promise<ApiResponse<any>> {
    const id = await this.getServiceProviderId();
    return apiClient.get(`/prestataires/${id}/stats`);
  }
}

export const serviceProviderService = new ServiceProviderService();