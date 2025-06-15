'use client';

import { useEffect, useCallback, useState } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';
import { toast } from 'sonner';
import {
	PartialDeliveryRequestEvent,
	SegmentProposalEvent,
	SegmentAcceptedEvent,
	SegmentStatusUpdatedEvent,
	DeliveryCoordinationEvent,
	PackageHandoverEvent,
	GroupChatMessageEvent,
	DeliverySegment,
	PartialDelivery
} from '@/types/api';

interface UsePartialDeliveryWebSocketProps {
	userType: 'client' | 'livreur';
	userId: number;
	onPartialDeliveryRequest?: (event: PartialDeliveryRequestEvent) => void;
	onSegmentProposal?: (event: SegmentProposalEvent) => void;
	onSegmentAccepted?: (event: SegmentAcceptedEvent) => void;
	onSegmentStatusUpdate?: (event: SegmentStatusUpdatedEvent) => void;
	onDeliveryCoordination?: (event: DeliveryCoordinationEvent) => void;
	onPackageHandover?: (event: PackageHandoverEvent) => void;
	onGroupChatMessage?: (event: GroupChatMessageEvent) => void;
	onSegmentAvailable?: (segment: DeliverySegment) => void;
}

export const usePartialDeliveryWebSocket = ({
	userType,
	userId,
	onPartialDeliveryRequest,
	onSegmentProposal,
	onSegmentAccepted,
	onSegmentStatusUpdate,
	onDeliveryCoordination,
	onPackageHandover,
	onGroupChatMessage,
	onSegmentAvailable
}: UsePartialDeliveryWebSocketProps) => {
	const { socket, on, emit } = useWebSocket();
	
	// États pour les données temps réel
	const [groupChatMessages, setGroupChatMessages] = useState<any[]>([]);
	const [coordinationData, setCoordinationData] = useState<any>(null);
	const [isConnected, setIsConnected] = useState(false);
	
	// Suivre l'état de connexion du socket
	useEffect(() => {
		setIsConnected(!!socket);
	}, [socket]);

	// ==================== ÉVÉNEMENTS ENTRANTS ====================

	// Demande de livraison partielle (pour les livreurs)
	useEffect(() => {
		if (!socket || userType !== 'livreur') return;

		const handlePartialDeliveryRequest = (event: PartialDeliveryRequestEvent) => {
			console.log('Nouvelle demande de livraison partielle:', event);
			
			toast.info('Nouvelle livraison partielle disponible', {
				description: `${event.segments.length} segments disponibles`,
				action: {
					label: 'Voir',
					onClick: () => onPartialDeliveryRequest?.(event)
				}
			});
		};

		return on('partial_delivery_request', handlePartialDeliveryRequest);
	}, [socket, userType, on, onPartialDeliveryRequest]);

	// Segment disponible (pour les livreurs)
	useEffect(() => {
		if (!socket || userType !== 'livreur') return;

		const handleSegmentAvailable = (segment: DeliverySegment) => {
			console.log('Nouveau segment disponible:', segment);
			
			toast.info('Nouveau segment de livraison', {
				description: `${segment.start_address} → ${segment.end_address}`,
				action: {
					label: 'Proposer',
					onClick: () => onSegmentAvailable?.(segment)
				}
			});
		};

		return on('segment_available', handleSegmentAvailable);
	}, [socket, userType, on, onSegmentAvailable]);

	// Proposition de segment (pour les clients)
	useEffect(() => {
		if (!socket || userType !== 'client') return;

		const handleSegmentProposal = (event: SegmentProposalEvent) => {
			console.log('Proposition de segment reçue:', event);
			
			toast.info('Nouvelle proposition de livreur', {
				description: `${event.livreur.user.nom} propose ${event.proposed_cost}€`,
				action: {
					label: 'Voir',
					onClick: () => onSegmentProposal?.(event)
				}
			});
		};

		return on('segment_proposal', handleSegmentProposal);
	}, [socket, userType, on, onSegmentProposal]);

	// Acceptation de segment
	useEffect(() => {
		if (!socket) return;

		const handleSegmentAccepted = (event: SegmentAcceptedEvent) => {
			console.log('Segment accepté:', event);
			
			if (userType === 'livreur' && event.livreur_id === userId) {
				toast.success('Segment accepté!', {
					description: 'Votre proposition a été acceptée'
				});
			} else if (userType === 'client' && event.client_id === userId) {
				toast.success('Livreur assigné!', {
					description: `${event.livreur.user.nom} prendra en charge ce segment`
				});
			}
			
			onSegmentAccepted?.(event);
		};

		return on('segment_accepted', handleSegmentAccepted);
	}, [socket, userType, userId, on, onSegmentAccepted]);

	// Mise à jour de statut de segment
	useEffect(() => {
		if (!socket) return;

		const handleSegmentStatusUpdate = (event: SegmentStatusUpdatedEvent) => {
			console.log('Statut de segment mis à jour:', event);
			
			const statusMessages = {
				in_progress: 'Segment en cours',
				completed: 'Segment terminé',
				cancelled: 'Segment annulé'
			};
			
			const message = statusMessages[event.status as keyof typeof statusMessages];
			if (message) {
				toast.info(message, {
					description: `Segment #${event.segment_id}`
				});
			}
			
			onSegmentStatusUpdate?.(event);
		};

		return on('segment_status_updated', handleSegmentStatusUpdate);
	}, [socket, on, onSegmentStatusUpdate]);

	// Coordination entre livreurs
	useEffect(() => {
		if (!socket || userType !== 'livreur') return;

		const handleDeliveryCoordination = (event: DeliveryCoordinationEvent) => {
			console.log('Coordination de livraison:', event);
			
			// Mettre à jour les données de coordination
			setCoordinationData(event);
			
			if (event.currentLivreurId === userId || event.nextLivreurId === userId) {
				toast.info('Coordination requise', {
					description: `Rendez-vous à ${event.handoverLocation.address}`,
					action: {
						label: 'Voir détails',
						onClick: () => onDeliveryCoordination?.(event)
					}
				});
			}
		};

		return on('delivery_coordination', handleDeliveryCoordination);
	}, [socket, userType, userId, on, onDeliveryCoordination]);

	// Remise de colis
	useEffect(() => {
		if (!socket || userType !== 'livreur') return;

		const handlePackageHandover = (event: PackageHandoverEvent) => {
			console.log('Remise de colis:', event);
			
			if (event.fromLivreurId === userId || event.toLivreurId === userId) {
				const isReceiver = event.toLivreurId === userId;
				const isSender = event.fromLivreurId === userId;
				
				toast.success(isReceiver ? 'Colis reçu!' : 'Colis remis!', {
					description: `À ${event.handoverLocation.address}`,
					action: {
						label: 'Voir détails',
						onClick: () => onPackageHandover?.(event)
					}
				});
			}
		};

		return on('package_handover', handlePackageHandover);
	}, [socket, userType, userId, on, onPackageHandover]);

	// Messages de chat de groupe
	useEffect(() => {
		if (!socket) return;

		const handleGroupChatMessage = (event: GroupChatMessageEvent) => {
			console.log('Message de chat de groupe:', event);
			
			// Ajouter le message à la liste
			setGroupChatMessages(prev => [...prev, event]);
			
			// Ne pas afficher de notification pour ses propres messages
			if (event.sender.id === userId) return;
			
			const messageTypeLabels = {
				coordination: '📍 Coordination',
				status_update: '📊 Mise à jour',
				general: '💬 Message'
			};
			
			toast.info(`${messageTypeLabels[event.messageType]} - ${event.sender.nom}`, {
				description: event.message.content.substring(0, 50) + (event.message.content.length > 50 ? '...' : ''),
				action: {
					label: 'Voir chat',
					onClick: () => onGroupChatMessage?.(event)
				}
			});
		};

		return on('group_chat_message', handleGroupChatMessage);
	}, [socket, userId, on, onGroupChatMessage]);

	// ==================== FONCTIONS D'ÉMISSION ====================

	// Demander une livraison partielle
	const requestPartialDelivery = useCallback((livraisonId: number, segments: Omit<DeliverySegment, 'id' | 'created_at' | 'updated_at'>[]) => {
		if (!socket) return;
		
		emit('request_partial_delivery', {
			livraison_id: livraisonId,
			segments
		});
	}, [socket, emit]);

	// Proposer un segment
	const proposeSegment = useCallback((segmentId: number, proposedCost: number, estimatedDuration: number) => {
		if (!socket) return;
		
		emit('propose_segment', {
			segment_id: segmentId,
			proposed_cost: proposedCost,
			estimated_duration: estimatedDuration
		});
	}, [socket, emit]);

	// Accepter une proposition de segment
	const acceptSegmentProposal = useCallback((segmentId: number, livreurId: number) => {
		if (!socket) return;
		
		emit('accept_segment_proposal', {
			segment_id: segmentId,
			livreur_id: livreurId
		});
	}, [socket, emit]);

	// Mettre à jour le statut d'un segment
	const updateSegmentStatus = useCallback((segmentId: number, status: DeliverySegment['status'], location?: { latitude: number; longitude: number }) => {
		if (!socket) return;
		
		emit('update_segment_status', {
			segment_id: segmentId,
			status,
			location
		});
	}, [socket, emit]);

	// Initier une coordination
	const initiateCoordination = useCallback((livraisonId: number, currentSegmentId: number, nextSegmentId: number, handoverLocation: { latitude: number; longitude: number; address: string }) => {
		if (!socket) return;
		
		emit('initiate_coordination', {
			livraisonId: livraisonId,
			currentSegmentId: currentSegmentId,
			nextSegmentId: nextSegmentId,
			handoverLocation: handoverLocation
		});
	}, [socket, emit]);

	// Confirmer une remise de colis
	const confirmPackageHandover = useCallback((livraisonId: number, fromSegmentId: number, toSegmentId: number, handoverLocation: { latitude: number; longitude: number; address: string }, verificationCode?: string) => {
		if (!socket) return;
		
		emit('confirm_package_handover', {
			livraisonId: livraisonId,
			fromSegmentId: fromSegmentId,
			toSegmentId: toSegmentId,
			handoverLocation: handoverLocation,
			verificationCode: verificationCode
		});
	}, [socket, emit]);

	// Envoyer un message de chat de groupe
	const sendGroupChatMessage = useCallback((livraisonId: number, content: string, messageType: GroupChatMessageEvent['messageType'] = 'general') => {
		if (!socket) return;
		
		emit('send_group_chat_message', {
			livraisonId: livraisonId,
			content,
			messageType: messageType
		});
	}, [socket, emit]);

	// Rejoindre le chat de coordination d'une livraison
	const joinDeliveryCoordinationChat = useCallback((livraisonId: number) => {
		if (!socket) return;
		
		emit('join_delivery_coordination', {
			livraisonId: livraisonId
		});
	}, [socket, emit]);

	// Quitter le chat de coordination d'une livraison
	const leaveDeliveryCoordinationChat = useCallback((livraisonId: number) => {
		if (!socket) return;
		
		emit('leave_delivery_coordination', {
			livraisonId: livraisonId
		});
	}, [socket, emit]);

	return {
		// État de connexion
		isConnected,
		// Données temps réel
		groupChatMessages,
		coordinationData,
		// Fonctions d'émission
		requestPartialDelivery,
		proposeSegment,
		acceptSegmentProposal,
		updateSegmentStatus,
		initiateCoordination,
		confirmPackageHandover,
		sendGroupChatMessage,
		joinDeliveryCoordinationChat,
		leaveDeliveryCoordinationChat,
		// Alias pour compatibilité
		joinCoordination: joinDeliveryCoordinationChat,
		leaveCoordination: leaveDeliveryCoordinationChat,
		updateLocation: updateSegmentStatus
	};
};