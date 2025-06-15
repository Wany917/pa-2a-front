'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	Package,
	ChevronRight,
	ArrowUp,
} from 'lucide-react';
import { useLanguage } from '@/components/language-context';
import { useApiCall } from '@/hooks/use-api-call';
import { useLivreurWebSocket } from '@/hooks/use-livreur-websocket';
import { livreurService } from '@/services/livreurService';
import type { Livraison } from '@/types/api';

// Interface pour utilisateur multi-rôles
interface MultiRoleUser {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	address?: string | null;
	city?: string | null;
	postalCode?: string | null;
	country?: string | null;
	phoneNumber?: string | null;
	state?: string;
	createdAt?: string;
	updatedAt?: string;
	role?: string;
	livreur?: {
		id: number;
		availabilityStatus: 'available' | 'busy' | 'offline';
		rating: string | null;
		createdAt: string;
		updatedAt: string;
	};
	client?: any;
	admin?: {
		id: number;
		privileges: string;
		createdAt: string;
		updatedAt: string;
	};
	prestataire?: any;
	commercant?: any;
}

interface RecentDelivery {
	id: string;
	customer: string;
	address: string;
	status: string;
	statusClass: string;
	date: string;
	rawDate: string;
}

export function DeliverymanDashboardContent() {
	const { t } = useLanguage();
	const router = useRouter();
	const [first_name, setUserName] = useState('');
	const [user, setUser] = useState<MultiRoleUser | null>(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
	const [stats, setStats] = useState([
		{
			title: t('deliveryman.totalDeliveries'),
			value: '0',
			change: '0%',
			changeType: 'positive',
			icon: <Package className='h-6 w-6 text-indigo-500' />,
			bgColor: 'bg-indigo-50',
		},
		{
			title: t('deliveryman.activeDeliveries'),
			value: '0',
			change: '0%',
			changeType: 'positive',
			icon: <Package className='h-6 w-6 text-amber-500' />,
			bgColor: 'bg-amber-50',
		},
		{
			title: t('deliveryman.completedDeliveries'),
			value: '0',
			change: '0%',
			changeType: 'positive',
			icon: <Package className='h-6 w-6 text-rose-500' />,
			bgColor: 'bg-rose-50',
		},
	]);

	useEffect(() => {
		const token =
			sessionStorage.getItem('authToken') ||
			localStorage.getItem('authToken');
		if (!token) return;

		fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			credentials: 'include',
		})
			.then((res) => {
				if (!res.ok) throw new Error('Unauthorized');
				return res.json();
			})
			.then((data) => {
				setIsAdmin(data.role === 'admin' || data.admin);
				setUserName(data.firstName);
				setUser(data);
				// State updates are asynchronous, so we need to use the data directly
				setTimeout(() => loadDashboardData(data), 0);
			})
			.catch((err) => console.error('Auth/me failed:', err));
	}, []);

	const { execute: executeGetProfile, loading: profileLoading } =
		useApiCall<MultiRoleUser>();
	const { execute: executeGetLivraisons, loading: livraisonsLoading } =
		useApiCall<Livraison[]>();
	const { execute: executeGetStats, loading: statsLoading } =
		useApiCall<any>();

	// Update the websocket hook to use a ref for the user ID
	const userIdRef = useRef<number>(0);

	// Update the websocket hook to use the ref
	const websocket = useLivreurWebSocket({
		userId: userIdRef.current,
		onNewDeliveryAvailable: (data) => {
			console.log('Nouvelle livraison disponible:', data);
			if (user) {
				loadLivraisonsData();
			}
		},
		onDeliveryAcceptedSuccess: (data) => {
			console.log('Livraison acceptée avec succès:', data);
			if (user) {
				loadLivraisonsData();
			}
		},
		enableNotifications: true,
		enableLocationTracking: false,
	});

	// Update the userIdRef when user changes
	useEffect(() => {
		if (user?.livreur?.id) {
			userIdRef.current = user.livreur.id;
			console.log('User ID updated for websocket:', userIdRef.current);
		}
	}, [user?.livreur?.id]);

	const loadDashboardData = async (userData = user) => {
		try {
			if (!userData?.id) {
				console.error("Utilisateur invalide - pas d'ID:", userData);
				throw new Error('Profil utilisateur invalide');
			}

			// Permettre l'accès aux livreurs ET aux admins
			if (!userData?.livreur?.id && !userData?.admin) {
				console.error('Utilisateur non-livreur et non-admin:', userData);
				throw new Error('Accès non autorisé : rôle livreur ou admin requis');
			}

			// Remove redundant setUser call
			setUserName(userData.firstName || 'Livreur');

			await loadLivraisonsData();
		} catch (error) {
			console.error(
				'Erreur lors du chargement du profil utilisateur:',
				error
			);
		}
	};

	const loadLivraisonsData = async () => {
		try {
			console.log('Tentative de chargement des livraisons...');
			const livraisonsResponse: any = await executeGetLivraisons(
				livreurService.getMyLivraisons()
			);
			console.log(
				'🟡 LIVRAISONS RÉPONSE COMPLÈTE:',
				JSON.stringify(livraisonsResponse, null, 2)
			);

			// Extraire les livraisons de la structure de réponse correcte
			let livraisons: any[] = [];

			// Tester différentes structures possibles
			if (Array.isArray(livraisonsResponse)) {
				console.log('✅ Structure: Array direct');
				livraisons = livraisonsResponse;
			} else if (
				livraisonsResponse?.data &&
				Array.isArray(livraisonsResponse.data)
			) {
				console.log('✅ Structure: response.data');
				livraisons = livraisonsResponse.data;
			} else if (
				livraisonsResponse?.livraisons &&
				Array.isArray(livraisonsResponse.livraisons)
			) {
				console.log('✅ Structure: response.livraisons (array)');
				livraisons = livraisonsResponse.livraisons;
			} else if (
				livraisonsResponse?.livraisons?.data &&
				Array.isArray(livraisonsResponse.livraisons.data)
			) {
				console.log('✅ Structure: response.livraisons.data');
				livraisons = livraisonsResponse.livraisons.data;
			} else if (
				livraisonsResponse?.result &&
				Array.isArray(livraisonsResponse.result)
			) {
				console.log('✅ Structure: response.result');
				livraisons = livraisonsResponse.result;
			} else {
				console.warn(
					'🔴 Structure de réponse livraisons inattendue:',
					livraisonsResponse
				);
				console.log(
					'🔍 Type de livraisonsResponse:',
					typeof livraisonsResponse
				);
				console.log(
					'🔍 Clés disponibles:',
					Object.keys(livraisonsResponse || {})
				);

				// Essayer de trouver un array dans les propriétés
				if (
					typeof livraisonsResponse === 'object' &&
					livraisonsResponse !== null
				) {
					for (const [key, value] of Object.entries(
						livraisonsResponse
					)) {
						if (Array.isArray(value)) {
							console.log(
								`🟡 Trouvé un array dans la propriété "${key}":`,
								value
							);
							livraisons = value;
							break;
						}
					}
				}

				if (livraisons.length === 0) {
					livraisons = [];
				}
			}

			console.log(
				'🟡 Livraisons extraites:',
				livraisons,
				'Length:',
				livraisons.length
			);

			if (livraisons.length > 0) {
				console.log(
					'🟡 Première livraison exemple:',
					JSON.stringify(livraisons[0], null, 2)
				);
			}

			const formattedDeliveries = livraisons
				.slice(0, 5)
				.map((livraison: any) => {
					// Déterminer le statut et la classe CSS correspondante
					let status = 'pending';
					let statusClass = 'bg-yellow-100 text-yellow-800';

					if (livraison.status) {
						switch (livraison.status.toLowerCase()) {
							case 'pending':
							case 'en_attente':
								status = 'pending';
								statusClass = 'bg-yellow-100 text-yellow-800';
								break;
							case 'in_progress':
							case 'en_cours':
								status = 'inProgress';
								statusClass = 'bg-blue-100 text-blue-800';
								break;
							case 'delivered':
							case 'livree':
							case 'completed':
								status = 'delivered';
								statusClass = 'bg-green-100 text-green-800';
								break;
							case 'cancelled':
							case 'annulee':
								status = 'cancelled';
								statusClass = 'bg-red-100 text-red-800';
								break;
							default:
								status = 'pending';
								statusClass = 'bg-gray-100 text-gray-800';
						}
					}

					// Formater la date
					let formattedDate = 'Date inconnue';
					let rawDate = '';

					if (livraison.createdAt || livraison.created_at) {
						const dateStr = livraison.createdAt || livraison.created_at;
						rawDate = dateStr;
						try {
							const date = new Date(dateStr);
							formattedDate = date.toLocaleDateString('fr-FR', {
								day: '2-digit',
								month: '2-digit',
								year: 'numeric',
							});
						} catch (e) {
							console.error('Erreur de formatage de date:', e);
						}
					}

					// Extraire les informations client et adresse
					let customerName = 'Client inconnu';
					let address = 'Adresse inconnue';

					if (livraison.annonce) {
						if (livraison.annonce.client) {
							customerName = `${livraison.annonce.client.firstName || ''} ${
								livraison.annonce.client.lastName || ''
							}`.trim();
						}
						if (livraison.annonce.pickupAddress) {
							address = livraison.annonce.pickupAddress;
						} else if (livraison.annonce.pickup_address) {
							address = livraison.annonce.pickup_address;
						}
					}

					return {
						id: `#${livraison.id || 'N/A'}`,
						customer: customerName,
						address: address,
						status: status,
						statusClass: statusClass,
						date: formattedDate,
						rawDate: rawDate,
					};
				});

			setRecentDeliveries(formattedDeliveries);

			// Calculer les statistiques
			const totalDeliveries = livraisons.length;
			const activeDeliveries = livraisons.filter(
				(l: any) =>
					l.status === 'in_progress' ||
					l.status === 'en_cours' ||
					l.status === 'pending' ||
					l.status === 'en_attente'
			).length;
			const completedDeliveries = livraisons.filter(
				(l: any) =>
					l.status === 'delivered' ||
					l.status === 'livree' ||
					l.status === 'completed'
			).length;

			setStats([
				{
					title: t('deliveryman.totalDeliveries'),
					value: totalDeliveries.toString(),
					change: '+12%',
					changeType: 'positive',
					icon: <Package className='h-6 w-6 text-indigo-500' />,
					bgColor: 'bg-indigo-50',
				},
				{
					title: t('deliveryman.activeDeliveries'),
					value: activeDeliveries.toString(),
					change: '+8%',
					changeType: 'positive',
					icon: <Package className='h-6 w-6 text-amber-500' />,
					bgColor: 'bg-amber-50',
				},
				{
					title: t('deliveryman.completedDeliveries'),
					value: completedDeliveries.toString(),
					change: '+15%',
					changeType: 'positive',
					icon: <Package className='h-6 w-6 text-rose-500' />,
					bgColor: 'bg-rose-50',
				},
			]);
		} catch (error) {
			console.error(
				'Erreur lors du chargement des livraisons:',
				error
			);
			setRecentDeliveries([]);
		}
	};

	const loading = profileLoading || livraisonsLoading || statsLoading;

	// Charger les données quand l'utilisateur est connecté via WebSocket
	useEffect(() => {
		if (websocket.isConnected && user?.livreur?.id) {
			console.log(
				'WebSocket connecté, rechargement des données de livraison...'
			);
			loadLivraisonsData();
		}
	}, [user?.livreur?.id, websocket.isConnected]);

	return (
		<div className='space-y-6'>
			<h1 className='text-2xl font-bold'>
				{t('deliveryman.dashboard')}
			</h1>

			{loading && (
				<div className='mb-6 text-center'>
					<div className='text-gray-500'>
						{t('common.loading')}
					</div>
				</div>
			)}

			<div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{stats.map((stat, index) => (
					<div
						key={index}
						className='overflow-hidden rounded-lg bg-white shadow'
					>
						<div className='p-5'>
							<div className='flex items-center'>
								<div className='flex-shrink-0'>
									<div
										className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgColor}`}
									>
										{stat.icon}
									</div>
								</div>
								<div className='ml-5 w-0 flex-1'>
									<dl>
										<dt className='text-sm font-medium text-gray-500 truncate'>
											{stat.title}
										</dt>
										<dd>
											<div className='text-lg font-medium text-gray-900'>
												{stat.value}
											</div>
										</dd>
									</dl>
								</div>
							</div>
						</div>
						<div className='bg-gray-50 px-5 py-3'>
							<div className='text-sm'>
								<span
									className={`inline-flex items-center ${
										stat.changeType === 'positive'
											? 'text-green-600'
											: 'text-red-600'
									}`}
								>
									<ArrowUp
										className={`mr-1.5 h-4 w-4 flex-shrink-0 ${
											stat.changeType ===
											'positive'
												? 'text-green-500'
												: 'text-red-500 transform rotate-180'
										}`}
									/>
									<span className='font-medium'>
										{stat.change}
									</span>
									<span className='ml-1'>
										{t('deliveryman.fromYesterday')}
									</span>
								</span>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className='overflow-hidden rounded-lg bg-white shadow'>
				<div className='flex items-center justify-between p-6'>
					<h2 className='text-lg font-medium text-gray-900'>
						{t('deliveryman.recentDeliveries')}
					</h2>
					<Link
						href='/app_deliveryman/deliveries'
						className='flex items-center text-sm font-medium text-green-600 hover:text-green-500'
					>
						<span>{t('deliveryman.viewAll')}</span>
						<ChevronRight className='ml-1 h-4 w-4' />
					</Link>
				</div>

				<div className='divide-y divide-gray-200'>
					{recentDeliveries.length > 0 ? (
						recentDeliveries.map((delivery, index) => (
							<div key={index} className='p-6'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center'>
										<div className='flex-shrink-0'>
											<Package className='h-8 w-8 text-gray-400' />
										</div>
										<div className='ml-4'>
											<div className='text-sm font-medium text-gray-900'>
												{delivery.id}
											</div>
											<div className='text-sm text-gray-500'>
												{delivery.customer}
											</div>
											<div className='text-sm text-gray-500'>
												{delivery.address}
											</div>
										</div>
									</div>
									<div className='flex items-center'>
										<span
											className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${delivery.statusClass}`}
										>
											{t(
												`deliveryman.${delivery.status}`
											)}
										</span>
										<div className='ml-4 text-sm text-gray-500'>
											{delivery.date}
										</div>
									</div>
								</div>
							</div>
						))
					) : (
						<div className='p-6 text-center text-gray-500'>
							{loading
								? t('common.loading')
								: t('deliveryman.noRecentDeliveries')}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}