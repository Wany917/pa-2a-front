import apiClient from '@/config/api';
import type { Annonce, Commercant, Message, ApiResponse, User } from '@/types/api';

interface MultiRoleUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  commercant?: { id: number; business_name?: string; verification_status: string; };
}

class ShopkeeperService {
  private async getShopkeeperId(): Promise<number> {
    const userResponse = await apiClient.get<MultiRoleUser>('/auth/me');
    if (!userResponse.data.commercant?.id) {
      throw new Error('Unauthorized: shopkeeper role required');
    }
    return userResponse.data.commercant.id;
  }

  async getProfile(): Promise<ApiResponse<Commercant>> {
    const id = await this.getShopkeeperId();
    return apiClient.get(`/commercants/${id}`);
  }

  async updateProfile(data: Partial<Commercant>): Promise<ApiResponse<Commercant>> {
    const id = await this.getShopkeeperId();
    return apiClient.put(`/commercants/${id}`, data);
  }

  async getMyAnnonces(): Promise<ApiResponse<{ annonces: Annonce[] }>> {
    const userResponse = await apiClient.get<User>('/auth/me');
    return apiClient.get(`/annonces/user/${userResponse.data.id}`);
  }

  async createAnnonce(data: any): Promise<ApiResponse<Annonce>> {
    return apiClient.post('/annonces/create', data);
  }

  async getConversations(): Promise<ApiResponse<any[]>> {
    const userResponse = await apiClient.get<User>('/auth/me');
    return apiClient.get(`/messages/conversations/${userResponse.data.id}`);
  }

  async sendMessage(data: any): Promise<ApiResponse<Message>> {
    return apiClient.post('/messages/send', data);
  }

  async getStats(): Promise<ApiResponse<any>> {
    const id = await this.getShopkeeperId();
    return apiClient.get(`/commercants/${id}/stats`);
  }
}

export const shopkeeperService = new ShopkeeperService();