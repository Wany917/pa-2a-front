import apiClient, { API_ROUTES } from '@/config/api';
import { ApiResponse } from '@/types/api';
import {
	DeliverySegment,
	PartialDelivery,
	Livraison
} from '@/types/api';

// ==================== TYPES DE REQUÊTES ====================

interface CreatePartialDeliveryRequest {
	originalLivraisonId: number;
	segments: {
		livreurId: number;
		pickupLocation: {
			latitude: number;
			longitude: number;
			address: string;
		};
		dropoffLocation: {
			latitude: number;
			longitude: number;
			address: string;
		};
		estimatedDuration: number;
		cost: number;
		order: number;
	}[];
}

interface ProposeSegmentRequest {
	segmentId: number;
	proposedCost: number;
	estimatedDuration: number;
}

interface AcceptSegmentProposalRequest {
	segmentId: number;
	livreurId: number;
}

interface UpdateSegmentStatusRequest {
	segmentId: number;
	status: DeliverySegment['status'];
	location?: {
		latitude: number;
		longitude: number;
	};
	remarks?: string;
}

interface InitiateCoordinationRequest {
	livraisonId: number;
	currentSegmentId: number;
	nextSegmentId: number;
	handoverLocation: {
		latitude: number;
		longitude: number;
		address: string;
	};
	estimatedHandoverTime: string;
}

interface ConfirmHandoverRequest {
	coordinationId: number;
	verificationCode: string;
	location: {
		latitude: number;
		longitude: number;
	};
	remarks?: string;
}

interface UpdateLocationRequest {
	livraisonId: number;
	segmentId: number;
	location: {
		latitude: number;
		longitude: number;
	};
	timestamp?: string;
}

// ==================== RÉPONSES ====================

interface SegmentProposal {
	id: number;
	segmentId: number;
	livreurId: number;
	livreur: {
		id: number;
		user: {
			id: number;
			nom: string;
			prenom: string;
			email: string;
			phone?: string;
		};
		rating?: number;
		totalDeliveries?: number;
	};
	proposedCost: number;
	estimatedDuration: number;
	status: 'pending' | 'accepted' | 'rejected';
	proposedAt: string;
}

interface SegmentWithProposals extends DeliverySegment {
	proposals: SegmentProposal[];
}

interface CoordinationInfo {
	id: number;
	livraisonId: number;
	currentSegment: DeliverySegment;
	nextSegment?: DeliverySegment;
	handoverLocation: {
		latitude: number;
		longitude: number;
		address: string;
	};
	estimatedHandoverTime: string;
	status: 'pending' | 'in_progress' | 'completed';
	createdAt: string;
}

// ==================== SERVICE ====================

export class PartialDeliveryService {
	// ==================== GESTION DES LIVRAISONS PARTIELLES ====================

	/**
	 * Créer une demande de livraison partielle
	 */
	static async createPartialDelivery(data: CreatePartialDeliveryRequest): Promise<ApiResponse<PartialDelivery>> {
		return apiClient.post<PartialDelivery>(API_ROUTES.PARTIAL_DELIVERIES.CREATE, data);
	}

	/**
	 * Obtenir les détails d'une livraison partielle
	 */
	static async getPartialDelivery(id: number): Promise<ApiResponse<PartialDelivery>> {
		return apiClient.get<PartialDelivery>(API_ROUTES.PARTIAL_DELIVERIES.GET(id));
	}

	/**
	 * Obtenir toutes les livraisons partielles
	 */
	static async getPartialDeliveries(params?: {
		status?: string;
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<PartialDelivery[]>> {
		return apiClient.get<PartialDelivery[]>(API_ROUTES.PARTIAL_DELIVERIES.GET_ALL, { params });
	}

	/**
	 * Obtenir toutes les livraisons partielles d'un utilisateur
	 */
	static async getUserPartialDeliveries(userId: number, params?: {
		status?: string;
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<{ deliveries: PartialDelivery[]; total: number; page: number; limit: number }>> {
		return apiClient.get<{ deliveries: PartialDelivery[]; total: number; page: number; limit: number }>(API_ROUTES.PARTIAL_DELIVERIES.USER_DELIVERIES(userId), { params });
	}

	/**
	 * Annuler une livraison partielle
	 */
	static async cancelPartialDelivery(id: number, reason?: string): Promise<ApiResponse<PartialDelivery>> {
		return apiClient.patch<PartialDelivery>(API_ROUTES.PARTIAL_DELIVERIES.CANCEL(id), { reason });
	}

	/**
	 * Initier la coordination pour une livraison partielle
	 */
	static async initiateCoordination(data: {
		livraisonId: number;
		currentSegmentId: number;
		nextLivreurId?: number;
		handoverLocation?: {
			latitude: number;
			longitude: number;
			address: string;
		};
		estimatedHandoverTime?: string;
		notes?: string;
	}): Promise<ApiResponse<any>> {
		return apiClient.post(API_ROUTES.COORDINATION.INITIATE, data);
	}

	// ==================== GESTION DES SEGMENTS ====================

	/**
	 * Obtenir les segments disponibles pour un livreur
	 */
	static async getAvailableSegments(params?: {
		latitude?: number;
		longitude?: number;
		radius?: number; // en km
		max_distance?: number;
		min_cost?: number;
		max_cost?: number;
	}): Promise<ApiResponse<DeliverySegment[]>> {
		return apiClient.get<DeliverySegment[]>(API_ROUTES.SEGMENTS.AVAILABLE, { params });
	}

	/**
	 * Obtenir les détails d'un segment avec ses propositions
	 */
	static async getSegmentWithProposals(segmentId: number): Promise<ApiResponse<SegmentWithProposals>> {
		return apiClient.get<SegmentWithProposals>(API_ROUTES.SEGMENTS.GET_WITH_PROPOSALS(segmentId));
	}

	/**
	 * Proposer un segment (pour les livreurs)
	 */
	static async proposeSegment(data: ProposeSegmentRequest): Promise<ApiResponse<SegmentProposal>> {
		return apiClient.post<SegmentProposal>(API_ROUTES.SEGMENTS.PROPOSE, data);
	}

	/**
	 * Accepter une proposition de segment (pour les clients)
	 */
	static async acceptSegmentProposal(data: AcceptSegmentProposalRequest): Promise<ApiResponse<DeliverySegment>> {
		return apiClient.post<DeliverySegment>(API_ROUTES.SEGMENTS.ACCEPT_PROPOSAL, data);
	}

	/**
	 * Rejeter une proposition de segment (pour les clients)
	 */
	static async rejectSegmentProposal(proposalId: number, reason?: string): Promise<ApiResponse<void>> {
		return apiClient.patch<void>(API_ROUTES.SEGMENT_PROPOSALS.REJECT(proposalId), { reason });
	}

	/**
	 * Mettre à jour le statut d'un segment (pour les livreurs)
	 */
	static async updateSegmentStatus(data: UpdateSegmentStatusRequest): Promise<ApiResponse<DeliverySegment>> {
		return apiClient.patch<DeliverySegment>(API_ROUTES.SEGMENTS.UPDATE_STATUS(data.segmentId), data);
	}

	/**
	 * Obtenir l'historique d'un segment
	 */
	static async getSegmentHistory(segmentId: number): Promise<ApiResponse<any[]>> {
		return apiClient.get<any[]>(API_ROUTES.SEGMENTS.HISTORY(segmentId));
	}

	// ==================== COORDINATION ET REMISE ====================

	/**
	 * Confirmer une remise de colis
	 */
	static async confirmHandover(data: ConfirmHandoverRequest): Promise<ApiResponse<void>> {
		return apiClient.post<void>(API_ROUTES.COORDINATION.CONFIRM_HANDOVER, data);
	}

	/**
	 * Obtenir les informations de coordination
	 */
	static async getCoordinationInfo(livraisonId: number): Promise<ApiResponse<CoordinationInfo[]>> {
		return apiClient.get<CoordinationInfo[]>(API_ROUTES.COORDINATION.GET_INFO(livraisonId));
	}

	/**
	 * Générer un code de vérification pour la remise
	 */
	static async generateVerificationCode(livraisonId: number, segmentId: number): Promise<ApiResponse<{ code: string; expiresAt: string }>> {
		return apiClient.post<{ code: string; expiresAt: string }>(API_ROUTES.COORDINATION.GENERATE_CODE, {
			livraisonId: livraisonId,
			segmentId: segmentId
		});
	}

	/**
	 * Valider un code de vérification
	 */
	static async validateVerificationCode(code: string, livraisonId: number): Promise<ApiResponse<{ valid: boolean; segmentId?: number }>> {
		return apiClient.post<{ valid: boolean; segmentId?: number }>(API_ROUTES.COORDINATION.VALIDATE_CODE, {
			code,
			livraisonId: livraisonId
		});
	}

	// ==================== STATISTIQUES ET RAPPORTS ====================

	/**
	 * Obtenir les statistiques des livraisons partielles pour un livreur
	 */
	static async getLivreurPartialStats(livreurId: number, params?: {
		startDate?: string;
		endDate?: string;
	}): Promise<ApiResponse<{
		totalSegments: number;
		completedSegments: number;
		totalEarnings: number;
		averageRating: number;
		successfulHandovers: number;
	}>> {
		return apiClient.get<{
			totalSegments: number;
			completedSegments: number;
			totalEarnings: number;
			averageRating: number;
			successfulHandovers: number;
		}>(API_ROUTES.LIVREURS.PARTIAL_STATS(livreurId), { params });
	}

	/**
	 * Obtenir les statistiques des livraisons partielles pour un client
	 */
	static async getClientPartialStats(clientId: number, params?: {
		startDate?: string;
		endDate?: string;
	}): Promise<ApiResponse<{
		totalPartialDeliveries: number;
		completedDeliveries: number;
		totalCost: number;
		averageDeliveryTime: number;
		satisfactionRate: number;
	}>> {
		return apiClient.get<{
			totalPartialDeliveries: number;
			completedDeliveries: number;
			totalCost: number;
			averageDeliveryTime: number;
			satisfactionRate: number;
		}>(API_ROUTES.CLIENTS.PARTIAL_STATS(clientId), { params });
	}

	// ==================== UTILITAIRES ====================

	/**
	 * Calculer le coût estimé d'une livraison partielle
	 */
	static async calculatePartialDeliveryCost(segments: {
		startLatitude: number;
		startLongitude: number;
		endLatitude: number;
		endLongitude: number;
		distance: number;
	}[]): Promise<ApiResponse<{
		totalCost: number;
		segmentCosts: number[];
		baseCost: number;
		coordinationFee: number;
	}>> {
		return apiClient.post<{
			totalCost: number;
			segmentCosts: number[];
			baseCost: number;
			coordinationFee: number;
		}>(API_ROUTES.PARTIAL_DELIVERIES.CALCULATE_COST, { segments });
	}

	/**
	 * Optimiser l'ordre des segments
	 */
	static async optimizeSegmentOrder(segments: {
		startLatitude: number;
		startLongitude: number;
		endLatitude: number;
		endLongitude: number;
	}[]): Promise<ApiResponse<{
		optimizedSegments: typeof segments;
		totalDistance: number;
		estimatedTime: number;
	}>> {
		return apiClient.post<{
			optimizedSegments: typeof segments;
			totalDistance: number;
			estimatedTime: number;
		}>(API_ROUTES.PARTIAL_DELIVERIES.OPTIMIZE_ROUTE, { segments });
	}

	/**
	 * Trouver des livreurs disponibles pour un segment
	 */
	static async findAvailableLivreurs(segmentId: number, params?: {
		radius?: number;
		minRating?: number;
		maxResults?: number;
	}): Promise<ApiResponse<{
		id: number;
		user: {
			id: number;
			nom: string;
			prenom: string;
		};
		rating: number;
		totalDeliveries: number;
		distanceFromStart: number;
		estimatedArrivalTime: number;
	}[]>> {
		return apiClient.get<{
			id: number;
			user: {
				id: number;
				nom: string;
				prenom: string;
			};
			rating: number;
			totalDeliveries: number;
			distanceFromStart: number;
			estimatedArrivalTime: number;
		}[]>(API_ROUTES.SEGMENTS.AVAILABLE_LIVREURS(segmentId), { params });
	}
}