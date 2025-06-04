import apiClient from '@/config/api';
import type {
	Annonce,
	Livraison,
	Colis,
	Message,
	Conversation,
	CreateAnnonceRequest,
	CreateLivraisonRequest,
	CreateColisRequest,
	SendMessageRequest,
	CreateComplaintRequest,
	Complaint,
	ApiResponse,
	PaginatedResponse,
	User,
} from '@/types/api';

class ClientService {
	// ========== Annonces ==========
	async createAnnonce(data: CreateAnnonceRequest): Promise<ApiResponse<Annonce>> {
		return apiClient.post('/annonces/create', data);
	}

	async getMyAnnonces(): Promise<ApiResponse<{ annonces: Annonce[] }>> {
		const userResponse = await apiClient.get<User>('/auth/me');
		const userId = userResponse.data.id;
		return apiClient.get(`/annonces/user/${userId}`);
	}

	async getAnnonceById(id: number): Promise<ApiResponse<{ annonce: Annonce }>> {
		return apiClient.get(`/annonces/${id}`);
	}

	async updateAnnonce(id: number, data: Partial<CreateAnnonceRequest>): Promise<ApiResponse<Annonce>> {
		return apiClient.put(`/annonces/${id}`, data);
	}

	async deleteAnnonce(id: number): Promise<ApiResponse<void>> {
		return apiClient.delete(`/annonces/${id}`);
	}

	async searchAnnonces(query: string, filters?: {
		category?: string;
		priceMin?: number;
		priceMax?: number;
		location?: string;
	}): Promise<ApiResponse<Annonce[]>> {
		return apiClient.get('/annonces/search', { params: { query, ...filters } });
	}

	// ========== Livraisons ==========
	async createLivraison(annonceId: number, data: CreateLivraisonRequest): Promise<ApiResponse<Livraison>> {
		return apiClient.post(`/annonces/${annonceId}/livraisons`, data);
	}

	async getMyLivraisons(): Promise<ApiResponse<Livraison[]>> {
		const userResponse = await apiClient.get<User>('/auth/me');
		const userId = userResponse.data.id;
		
		const response = await apiClient.get(`/livraisons/client/${userId}`);
		
		// Transformer la réponse paginée en format attendu
		if (response.success && (response.data as any)?.livraisons?.data) {
			return {
				success: true,
				data: (response.data as any).livraisons.data,
				message: response.message
			};
		}
		
		return {
			success: false,
			data: [],
			message: response.message || "Aucune livraison trouvée"
		};
	}

	async getLivraisonById(id: number): Promise<ApiResponse<Livraison>> {
		return apiClient.get(`/livraisons/${id}`);
	}

	async trackLivraison(id: number): Promise<ApiResponse<{
		livraison: Livraison;
		currentPosition?: {
			latitude: number;
			longitude: number;
			timestamp: string;
		};
		estimatedArrival?: string;
	}>> {
		return apiClient.get(`/tracking/livraison/${id}`);
	}

	async cancelLivraison(id: number, reason?: string): Promise<ApiResponse<Livraison>> {
		return apiClient.put(`/livraisons/${id}/cancel`, { reason });
	}

	// ========== Colis ==========
	async createColis(data: CreateColisRequest): Promise<ApiResponse<Colis>> {
		return apiClient.post('/colis/create', data);
	}

	async getMyColis(): Promise<ApiResponse<Colis[]>> {
		const userResponse = await apiClient.get<User>('/auth/me');
		const userId = userResponse.data.id; // Correction ici aussi
		
		return apiClient.get(`/colis/user/${userId}`);
	}

	async trackColis(trackingNumber: string): Promise<ApiResponse<{
		colis: Colis;
		history: Array<{
			status: string;
			location: string;
			timestamp: string;
			description?: string;
		}>;
	}>> {
		const response = await apiClient.get(`/colis/${trackingNumber}`);
		
		// Transformer la réponse pour correspondre au format attendu
		if (response.success && (response.data as any)?.colis) {
			return {
				success: true,
				data: {
					colis: (response.data as any).colis,
					history: (response.data as any).locationHistory || []
				},
				message: response.message
			};
		}
		
		return {
			success: false,
			data: { colis: {} as Colis, history: [] },
			message: response.message || "Colis non trouvé"
		};
	}

	async updateColisLocation(id: number, location: {
		type: 'warehouse' | 'storage_box' | 'client_address';
		address: string;
		locationId?: number;
	}): Promise<ApiResponse<Colis>> {
		return apiClient.put(`/colis/${id}/location`, location);
	}

	// ========== Services (recherche et commande) ==========
	async searchServices(query?: string, filters?: {
		category?: string;
		priceMin?: number;
		priceMax?: number;
		location?: string;
		availability?: boolean;
	}): Promise<ApiResponse<any[]>> {
		const params: Record<string, string | number> = {};
		if (query) params.q = query;
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined) {
					if (typeof value === 'boolean') {
						params[key] = value.toString();
					} else {
						params[key] = value;
					}
				}
			});
		}
		return apiClient.get('/services/search', { params });
	}

	async getServiceById(id: number): Promise<ApiResponse<any>> {
		return apiClient.get(`/services/${id}`);
	}

	async bookService(serviceId: number, data: {
		scheduled_date: string;
		notes?: string;
		address: string;
	}): Promise<ApiResponse<any>> {
		return apiClient.post(`/services/${serviceId}/book`, data);
	}

	// ========== Réclamations ==========
	async createComplaint(data: CreateComplaintRequest): Promise<ApiResponse<Complaint>> {
		return apiClient.post('/complaints/create', data);
	}

	async getMyComplaints(): Promise<ApiResponse<Complaint[]>> {
		const userResponse = await apiClient.get<User>('/auth/me');
		const userId = userResponse.data.id; // Correction ici aussi
		
		return apiClient.get(`/complaints/user/${userId}`);
	}

	async updateComplaint(id: number, data: {
		description?: string;
		category?: string;
		priority?: 'low' | 'medium' | 'high' | 'urgent';
	}): Promise<ApiResponse<Complaint>> {
		return apiClient.put(`/complaints/${id}`, data);
	}

	// ========== Messages ==========
	async sendMessage(data: SendMessageRequest): Promise<ApiResponse<Message>> {
		return apiClient.post('/messages', data);
	}

	async getConversations(): Promise<ApiResponse<Conversation[]>> {
		return apiClient.get('/messages/conversations');
	}

	async getMessageHistory(userId: number): Promise<ApiResponse<Message[]>> {
		return apiClient.get(`/messages/history/${userId}`);
	}

	async markMessageAsRead(messageId: number): Promise<ApiResponse<Message>> {
		return apiClient.put(`/messages/${messageId}/read`);
	}

	// ========== Profil utilisateur ==========
	async getProfile(): Promise<ApiResponse<User>> {
		return apiClient.get('/auth/me');
	}

	async updateProfile(data: {
		first_name?: string;
		last_name?: string;
		phone_number?: string;
		address?: string;
	}): Promise<ApiResponse<User>> {
		return apiClient.put('/auth/profile', data);
	}

	async changePassword(data: {
		current_password: string;
		new_password: string;
		confirm_password: string;
	}): Promise<ApiResponse<void>> {
		return apiClient.put('/auth/change-password', data);
	}

	// ========== Paiements ==========
	async getPaymentHistory(): Promise<ApiResponse<Array<{
		id: number;
		type: 'delivery' | 'service';
		description: string;
		amount: number;
		status: 'pending' | 'paid' | 'failed' | 'refunded';
		date: string;
		reference?: string;
	}>>> {
		const userResponse = await apiClient.get<User>('/auth/me');
		const userId = userResponse.data.id; // Correction ici aussi
		
		return apiClient.get(`/payments/user/${userId}`);
	}

	async processPayment(data: {
		type: 'delivery' | 'service';
		reference_id: number;
		amount: number;
		payment_method: 'card' | 'paypal' | 'bank_transfer';
		payment_details: Record<string, any>;
	}): Promise<ApiResponse<any>> {
		return apiClient.post('/payments/process', data);
	}

	// ========== Évaluations ==========
	async rateLivreur(livraisonId: number, data: {
		rating: number;
		comment?: string;
	}): Promise<ApiResponse<any>> {
		return apiClient.post(`/livraisons/${livraisonId}/rate-livreur`, data);
	}

	async rateService(serviceBookingId: number, data: {
		rating: number;
		comment?: string;
	}): Promise<ApiResponse<any>> {
		return apiClient.post(`/services/bookings/${serviceBookingId}/rate`, data);
	}

	// ========== Statistiques ==========
	async getStats(): Promise<ApiResponse<{
		totalAnnonces: number;
		totalLivraisons: number;
		totalColis: number;
		totalSpent: number;
		recentActivity: Array<{
			type: string;
			description: string;
			date: string;
		}>;
	}>> {
		const userResponse = await apiClient.get<User>('/auth/me');
		const userId = userResponse.data.id; // Correction ici aussi
		
		return apiClient.get(`/clients/${userId}/stats`);
	}

	// ========== Upload de fichiers ==========
	async uploadFile(file: File, type: 'image' | 'document'): Promise<ApiResponse<{ path: string; url: string }>> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('type', type);

		return apiClient.uploadFile('/files/upload', formData);
	}

  // Nouvelle méthode pour envoyer un email de suivi
  async sendTrackingEmail(data: {
    email: string;
    trackingId: string;
    packageName: string;
    recipientName: string;
    estimatedDelivery: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/send-email', {
      to: data.email,
      subject: "Votre colis est en route !",
      body: {
        templateType: "tracking",
        trackingId: data.trackingId,
        packageName: data.packageName,
        recipientName: data.recipientName,
        estimatedDelivery: data.estimatedDelivery
      }
    });
  }
}

export const clientService = new ClientService();