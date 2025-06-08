import apiClient, { API_ROUTES } from '@/config/api';
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
    const userResponse = await apiClient.get<MultiRoleUser>(API_ROUTES.AUTH.ME);
    if (!userResponse.data.commercant?.id) {
      throw new Error('Unauthorized: shopkeeper role required');
    }
    return userResponse.data.commercant.id;
  }

  async getProfile(): Promise<ApiResponse<Commercant>> {
    const id = await this.getShopkeeperId();
    return apiClient.get(API_ROUTES.COMMERCANTS.GET(id));
  }

  async updateProfile(data: Partial<Commercant>): Promise<ApiResponse<Commercant>> {
    const id = await this.getShopkeeperId();
    return apiClient.put(API_ROUTES.COMMERCANTS.UPDATE(id), data);
  }

  async getMyAnnonces(): Promise<ApiResponse<{ annonces: Annonce[] }>> {
    const userResponse = await apiClient.get<User>(API_ROUTES.AUTH.ME);
    return apiClient.get(API_ROUTES.ANNONCES.USER_ANNONCES(userResponse.data.id));
  }

  async createAnnonce(data: any): Promise<ApiResponse<Annonce>> {
    return apiClient.post(API_ROUTES.ANNONCES.CREATE, data);
  }

  async getConversations(): Promise<ApiResponse<any[]>> {
    const userResponse = await apiClient.get<User>(API_ROUTES.AUTH.ME);
    return apiClient.get(API_ROUTES.MESSAGES.USER_CONVERSATIONS(userResponse.data.id));
  }

  async sendMessage(data: any): Promise<ApiResponse<Message>> {
    return apiClient.post(API_ROUTES.MESSAGES.SEND, data);
  }

  async getStats(): Promise<ApiResponse<any>> {
    const id = await this.getShopkeeperId();
    return apiClient.get(API_ROUTES.COMMERCANTS.STATS(id));
  }
}

export const shopkeeperService = new ShopkeeperService();