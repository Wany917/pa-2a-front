import apiClient, { API_ROUTES } from '@/config/api';
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
		return apiClient.post(API_ROUTES.ANNONCES.CREATE, data);
	}

	async getMyAnnonces(): Promise<ApiResponse<{ annonces: Annonce[] }>> {
		const userResponse = await apiClient.get<User>(API_ROUTES.AUTH.ME);
		const userId = userResponse.data.id;
		return apiClient.get(API_ROUTES.ANNONCES.USER_ANNONCES(userId));
	}

	async getAnnonceById(id: number): Promise<ApiResponse<{ annonce: Annonce }>> {
		return apiClient.get(API_ROUTES.ANNONCES.GET(id));
	}

	async updateAnnonce(id: number, data: Partial<CreateAnnonceRequest>): Promise<ApiResponse<Annonce>> {
		return apiClient.put(API_ROUTES.ANNONCES.UPDATE(id), data);
	}

	async deleteAnnonce(id: number): Promise<ApiResponse<void>> {
		return apiClient.delete(API_ROUTES.ANNONCES.GET(id));
	}

	async searchAnnonces(query: string, filters?: {
		category?: string;
		priceMin?: number;
		priceMax?: number;
		location?: string;
	}): Promise<ApiResponse<Annonce[]>> {
		return apiClient.get(API_ROUTES.ANNONCES.ALL, { params: { query, ...filters } });
	}

	// ========== Livraisons ==========
	async createLivraison(annonceId: number, data: CreateLivraisonRequest): Promise<ApiResponse<Livraison>> {
		return apiClient.post(API_ROUTES.ANNONCES.CREATE_LIVRAISON(annonceId), data);
	}

	async getMyLivraisons(): Promise<ApiResponse<Livraison[]>> {
		const userResponse = await apiClient.get<User>(API_ROUTES.AUTH.ME);
		const userId = userResponse.data.id;
		
		const response = await apiClient.get(API_ROUTES.LIVRAISONS.CLIENT_LIVRAISONS(userId));
		
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
		return apiClient.get(API_ROUTES.LIVRAISONS.GET(id));
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
		return apiClient.get(API_ROUTES.TRACKING.LIVRAISON(id));
	}
	async cancelLivraison(id: number, reason?: string): Promise<ApiResponse<Livraison>> {
		return apiClient.put(API_ROUTES.LIVRAISONS.CANCEL(id), { reason });
	}

	// ========== Colis ==========
	async createColis(data: CreateColisRequest): Promise<ApiResponse<Colis>> {
		return apiClient.post(API_ROUTES.COLIS.CREATE, data);
	}

	async getMyColis(): Promise<ApiResponse<Colis[]>> {
		const userResponse = await apiClient.get<User>(API_ROUTES.AUTH.ME);
		const userId = userResponse.data.id; // Correction ici aussi
		
		return apiClient.get(API_ROUTES.COLIS.USER_COLIS(userId));
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
		const response = await apiClient.get(API_ROUTES.COLIS.TRACK(trackingNumber));
		
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
		return apiClient.put(API_ROUTES.COLIS.UPDATE_LOCATION(id), location);
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
		return apiClient.get(API_ROUTES.SERVICES.ALL, { params });
	}

	async getServiceById(id: number): Promise<ApiResponse<any>> {
		return apiClient.get(API_ROUTES.SERVICES.GET(id));
	}

	async bookService(serviceId: number, data: {
		scheduled_date: string;
		notes?: string;
		address: string;
	}): Promise<ApiResponse<any>> {
		return apiClient.post(API_ROUTES.SERVICES.BOOK(serviceId), data);
	}

	// ========== Réclamations ==========
	async createComplaint(data: CreateComplaintRequest): Promise<ApiResponse<Complaint>> {
		return apiClient.post(API_ROUTES.COMPLAINTS.CREATE, data);
	}

	async getMyComplaints(): Promise<ApiResponse<Complaint[]>> {
		const userResponse = await apiClient.get<User>(API_ROUTES.AUTH.ME);
		const userId = userResponse.data.id; // Correction ici aussi
		
		return apiClient.get(API_ROUTES.COMPLAINTS.USER_COMPLAINTS(userId));
	}

	async updateComplaint(id: number, data: {
		description?: string;
		category?: string;
		priority?: 'low' | 'medium' | 'high' | 'urgent';
	}): Promise<ApiResponse<Complaint>> {
		return apiClient.put(API_ROUTES.COMPLAINTS.UPDATE(id), data);
	}

	// ========== Messages ==========
	async sendMessage(data: SendMessageRequest): Promise<ApiResponse<Message>> {
		return apiClient.post(API_ROUTES.MESSAGES.SEND, data);
	}

	async getConversations(): Promise<ApiResponse<Conversation[]>> {
		return apiClient.get(API_ROUTES.MESSAGES.CONVERSATIONS);
	}

	async getMessageHistory(userId: number): Promise<ApiResponse<Message[]>> {
		return apiClient.get(API_ROUTES.MESSAGES.HISTORY(userId));
	}

	async markMessageAsRead(messageId: number): Promise<ApiResponse<Message>> {
		return apiClient.put(API_ROUTES.MESSAGES.MARK_READ(messageId));
	}

	// ========== Profil utilisateur ==========
	async getProfile(): Promise<ApiResponse<User>> {
		return apiClient.get(API_ROUTES.AUTH.ME);
	}

	async updateProfile(data: {
		first_name?: string;
		last_name?: string;
		phone_number?: string;
		address?: string;
	}): Promise<ApiResponse<User>> {
		return apiClient.put(API_ROUTES.AUTH.UPDATE_PROFILE, data);
	}

	async changePassword(data: {
		current_password: string;
		new_password: string;
		confirm_password: string;
	}): Promise<ApiResponse<void>> {
		return apiClient.put(API_ROUTES.AUTH.CHANGE_PASSWORD, data);
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
		const userResponse = await apiClient.get<User>(API_ROUTES.AUTH.ME);
		const userId = userResponse.data.id; // Correction ici aussi
		
		return apiClient.get(API_ROUTES.USERS.PAYMENTS(userId));
	}

	async processPayment(data: {
		type: 'delivery' | 'service';
		reference_id: number;
		amount: number;
		payment_method: 'card' | 'paypal' | 'bank_transfer';
		payment_details: Record<string, any>;
	}): Promise<ApiResponse<any>> {
		return apiClient.post(API_ROUTES.USERS.PROCESS_PAYMENT, data);
	}

	// ========== Évaluations ==========
	async rateLivreur(livraisonId: number, data: {
		rating: number;
		comment?: string;
	}): Promise<ApiResponse<any>> {
		return apiClient.post(API_ROUTES.LIVRAISONS.RATE_LIVREUR(livraisonId), data);
	}

	async rateService(serviceBookingId: number, data: {
		rating: number;
		comment?: string;
	}): Promise<ApiResponse<any>> {
		return apiClient.post(API_ROUTES.SERVICES.RATE(serviceBookingId), data);
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
		const userResponse = await apiClient.get<User>(API_ROUTES.AUTH.ME);
		const userId = userResponse.data.id; // Correction ici aussi
		
		return apiClient.get(API_ROUTES.CLIENTS.STATS(userId));
	}

	// ========== Upload de fichiers ==========
	async uploadFile(file: File, type: 'image' | 'document'): Promise<ApiResponse<{ path: string; url: string }>> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('type', type);

		return apiClient.uploadFile(API_ROUTES.USERS.UPLOAD_FILE, formData);
	}

  // Nouvelle méthode pour envoyer un email de suivi
  async sendTrackingEmail(data: {
    email: string;
    trackingId: string;
    packageName: string;
    recipientName: string;
    estimatedDelivery: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post(API_ROUTES.USERS.SEND_EMAIL, {
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