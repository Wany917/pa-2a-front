'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
	BarChart3,
	ChevronDown,
	LogOut,
	Menu,
	MessageSquare,
	Package,
	Edit,
	CreditCard,
	ChevronRight,
	ArrowUp,
	BellRing,
	PartyPopper,
	CheckCircle
} from 'lucide-react';
import { useLanguage } from '@/components/language-context';
import LanguageSelector from '@/components/language-selector';

export default function DeliverymanDashboard() {
  interface DeliveryItem {
    id: string;
    customer: string;
    address: string;
    status: string;
    statusClass: string;
    date: string;
    rawDate: string;
  }
	const { t } = useLanguage();
	const [first_name, setUserName] = useState('');
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
  const [recentDeliveries, setRecentDeliveries] = useState<DeliveryItem[]>([]);
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

	// Récupérer les informations utilisateur et les statistiques
	useEffect(() => {
		const fetchDashboardData = async () => {
			setLoading(true);

			try {
				const token =
					sessionStorage.getItem('authToken') ||
					localStorage.getItem('authToken');
				if (!token) {
					setError('Vous devez être connecté');
					setLoading(false);
					return;
				}

				// Récupérer les informations utilisateur
				const userResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						credentials: 'include',
					}
				);

				if (!userResponse.ok) {
					throw new Error('Unauthorized');
				}

				const userData = await userResponse.json();
				setUserName(userData.firstName);

				// Récupérer les livraisons du livreur
				const livraisonResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/livraisons/${userData.id}`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						credentials: 'include',
					}
				);

				if (!livraisonResponse.ok) {
					throw new Error(
						'Erreur lors de la récupération des livraisons'
					);
				}

				const livraisonsData = await livraisonResponse.json();
				const livraisons = Array.isArray(livraisonsData)
					? livraisonsData
					: livraisonsData.livraisons || [];

				console.log('Données des livraisons:', livraisons);

				// Préparer les livraisons récentes pour affichage
				const formattedDeliveries = await Promise.all(
					livraisons.slice(0, 5).map(
						async (livraison: {
							id: number;
							status: string;
							dropoffLocation?: string;
							createdAt: string;
							colis: Array<{
								annonceId?: number;
							}>;
						}) => {
							// Extraire le colis pour trouver l'annonce associée
							const colis =
								Array.isArray(livraison.colis) &&
								livraison.colis.length > 0
									? livraison.colis[0]
									: null;

							const annonceId = colis?.annonceId;

							// Récupérer les détails de l'annonce si disponible
							let customerName = 'Client';
							let deliveryAddress =
								livraison.dropoffLocation ||
								'Adresse non spécifiée';

							if (annonceId) {
								try {
									const annonceResponse = await fetch(
										`${process.env.NEXT_PUBLIC_API_URL}/annonces/${annonceId}`,
										{
											method: 'GET',
											headers: {
												'Content-Type':
													'application/json',
												Authorization: `Bearer ${token}`,
											},
											credentials: 'include',
										}
									);

									if (annonceResponse.ok) {
										const annonceData =
											await annonceResponse.json();
										if (annonceData.utilisateur) {
											customerName = `${
												annonceData.utilisateur
													.firstName || ''
											} ${
												annonceData.utilisateur
													.lastName || ''
											}`.trim();
										}
										if (annonceData.destinationAddress) {
											deliveryAddress =
												annonceData.destinationAddress;
										}
									}
								} catch (error) {
									console.error(
										"Erreur lors de la récupération de l'annonce:",
										error
									);
								}
							}

							// Déterminer le statut et la classe CSS correspondante
							let statusClass = 'bg-gray-100 text-gray-800';
							let statusKey = 'pending';

							switch (livraison.status) {
								case 'scheduled':
									statusClass = 'bg-blue-100 text-blue-800';
									statusKey = 'pending';
									break;
								case 'in_progress':
									statusClass =
										'bg-yellow-100 text-yellow-800';
									statusKey = 'inTransit';
									break;
								case 'completed':
									statusClass = 'bg-green-100 text-green-800';
									statusKey = 'delivered';
									break;
								case 'cancelled':
									statusClass = 'bg-red-100 text-red-800';
									statusKey = 'cancelled';
									break;
							}

							return {
								id: `#ECO-${livraison.id}`,
								customer: customerName,
								address: deliveryAddress,
								status: statusKey,
								statusClass: statusClass,
								date: formatDate(livraison.createdAt),
								rawDate: livraison.createdAt,
							};
						}
					)
				);

				// Trier par date (plus récent en premier)
				formattedDeliveries.sort(
					(a, b) =>
						new Date(b.rawDate).getTime() -
						new Date(a.rawDate).getTime()
				);

				setRecentDeliveries(formattedDeliveries as DeliveryItem[]);

				// Calculer les statistiques
				const totalDeliveries = livraisons.length;
				const activeDeliveries = livraisons.filter(
            (l: { status: string }) =>
						l.status === 'in_progress' || l.status === 'scheduled'
				).length;
				const completedDeliveries = livraisons.filter(
          (l: { status: string }) => l.status === 'completed'
				).length;

				setStats([
					{
						title: t('deliveryman.totalDeliveries'),
						value: totalDeliveries.toString(),
						change: '+0%',
						changeType: 'positive',
						icon: <Package className='h-6 w-6 text-indigo-500' />,
						bgColor: 'bg-indigo-50',
					},
					{
						title: t('deliveryman.activeDeliveries'),
						value: activeDeliveries.toString(),
						change: '+0%',
						changeType: 'positive',
						icon: <Clock className='h-6 w-6 text-amber-500' />,
						bgColor: 'bg-amber-50',
					},
					{
						title: t('deliveryman.completedDeliveries'),
						value: completedDeliveries.toString(),
						change: '+0%',
						changeType: 'positive',
						icon: (
							<CheckCircle className='h-6 w-6 text-green-500' />
						),
						bgColor: 'bg-green-50',
					},
				]);
			} catch (error) {
				console.error(
					'Erreur lors du chargement des données du tableau de bord:',
					error
				);
				setError(
					'Impossible de charger les données du tableau de bord'
				);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, [t]); // Ajout de t comme dépendance car elle est utilisée dans les stats

	// Fonction utilitaire pour formater la date
	const formatDate = (dateString: string) => {
		if (!dateString) return 'Date non spécifiée';

		try {
			const date = new Date(dateString);
			// Vérifier si la date est valide
			if (isNaN(date.getTime())) {
				return 'Date invalide';
			}

			return date.toLocaleDateString();
		} catch (error) {
			console.error('Erreur lors du formatage de la date:', error);
			return 'Date non spécifiée';
		}
	};

	return (
		<div className='flex h-screen bg-gray-50'>
			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
					isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
			>
				<div className='flex h-full flex-col'>
					{/* Logo */}
					<div className='flex h-16 items-center border-b px-6'>
						<Link
							href='/app_deliveryman'
							className='flex items-center'
						>
							<Image
								src='/logo.png'
								alt='EcoDeli'
								width={120}
								height={40}
								className='h-auto'
							/>
						</Link>
					</div>

					{/* Navigation */}
					<nav className='flex-1 overflow-y-auto p-4'>
						<ul className='space-y-1'>
							<li>
								<Link
									href='/app_deliveryman'
									className='flex items-center rounded-md bg-green-50 px-4 py-3 text-white'
								>
									<BarChart3 className='mr-3 h-5 w-5' />
									<span>{t('deliveryman.dashboard')}</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_deliveryman/announcements'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<PartyPopper className='mr-3 h-5 w-5' />
									<span>
										{t('deliveryman.announcements')}
									</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_deliveryman/deliveries'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<Package className='mr-3 h-5 w-5' />
									<span>{t('deliveryman.deliveries')}</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_deliveryman/notifications'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<BellRing className='mr-3 h-5 w-5' />
									<span>
										{t('deliveryman.notifications')}
									</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_deliveryman/messages'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<MessageSquare className='mr-3 h-5 w-5' />
									<span>{t('deliveryman.messages')}</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_deliveryman/payments'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<CreditCard className='mr-3 h-5 w-5' />
									<span>{t('deliveryman.payments')}</span>
								</Link>
							</li>
						</ul>
					</nav>
				</div>
			</aside>

			{/* Main content */}
			<div className='flex-1 overflow-x-hidden'>
				{/* Header */}
				<header className='sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6'>
					{/* Mobile menu button */}
					<button
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						className='rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden'
					>
						<Menu className='h-6 w-6' />
					</button>

					{/* Right actions */}
					<div className='ml-auto flex items-center space-x-4'>
						<LanguageSelector />

						{/* User menu - style adapté du dashboard client */}
						<div className='relative'>
							<button
								onClick={() =>
									setIsUserMenuOpen(!isUserMenuOpen)
								}
								className='flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors'
							>
								<User className='h-5 w-5 mr-2' />
								<span className='hidden sm:inline'>
									{first_name}
								</span>
								<ChevronDown className='h-4 w-4 ml-1' />
							</button>

							{isUserMenuOpen && (
								<div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100'>
									<Link
										href='/app_deliveryman/edit-account'
										className='flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100'
									>
										<Edit className='h-4 w-4 mr-2' />
										<span>{t('common.editAccount')}</span>
									</Link>

									<div className='border-t border-gray-100 my-1'></div>

									<Link
										href='/app_client'
										className='flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100'
									>
										<User className='h-4 w-4 mr-2' />
										<span>{t('common.clientSpace')}</span>
									</Link>

									<div className='border-t border-gray-100 my-1'></div>

									<div className='px-4 py-1 text-xs text-gray-500'>
										{t('common.accessToSpace')}
									</div>

									<Link
										href='/register/shopkeeper'
										className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
									>
										{t('common.shopkeeper')}
									</Link>

									<Link
										href='/register/service-provider'
										className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
									>
										{t('common.serviceProvider')}
									</Link>

									<div className='border-t border-gray-100 my-1'></div>

									<Link
										href='/logout'
										className='flex items-center px-4 py-2 text-red-600 hover:bg-gray-100'
									>
										<LogOut className='h-4 w-4 mr-2' />
										<span>{t('common.logout')}</span>
									</Link>
								</div>
							)}
						</div>
					</div>
				</header>

				{/* Page content */}
				<main className='p-4 lg:p-6'>
					<h1 className='mb-6 text-2xl font-bold'>
						{t('deliveryman.dashboard')}
					</h1>

					{/* Stats cards */}
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

					{/* Recent deliveries section */}
					<div className='overflow-hidden rounded-lg bg-white shadow'>
						<div className='flex items-center justify-between p-6'>
							<h2 className='text-lg font-medium text-gray-900'>
								{t('deliveryman.recentDeliveries')}
							</h2>
							<Link
								href='/app_deliveryman/deliveries'
								className='flex items-center text-sm font-medium text-green-600 hover:text-green-500'
							>
								{t('deliveryman.viewAll')}
								<ChevronRight className='ml-1 h-4 w-4' />
							</Link>
						</div>

						<div className='border-t border-gray-200'>
							{loading ? (
								<div className='flex justify-center items-center p-8'>
									<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500'></div>
								</div>
							) : error ? (
								<div className='p-8 text-center text-red-500'>
									{error}
								</div>
							) : recentDeliveries.length === 0 ? (
								<div className='p-8 text-center text-gray-500'>
									<Package className='mx-auto h-12 w-12 text-gray-400 mb-4' />
									<p>{t('deliveryman.noDeliveriesYet')}</p>
									<Link
										href='/app_deliveryman/announcements'
										className='mt-2 inline-block text-green-500 hover:text-green-600'
									>
										{t('deliveryman.browseAnnouncements')}
									</Link>
								</div>
							) : (
								<div className='overflow-x-auto'>
									<table className='min-w-full divide-y divide-gray-200'>
										<thead className='bg-gray-50'>
											<tr>
												<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
													{t('deliveryman.orderId')}
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
													{t('deliveryman.customer')}
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
													{t('deliveryman.address')}
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
													{t('deliveryman.status')}
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
													{t('deliveryman.date')}
												</th>
											</tr>
										</thead>
										<tbody className='divide-y divide-gray-200 bg-white'>
											{recentDeliveries.map((item) => (
												<tr
													key={item.id}
													className='hover:bg-gray-50 cursor-pointer'
													onClick={() =>
														(window.location.href = `/app_deliveryman/delivery/${item.id.replace(
															'#ECO-',
															''
														)}`)
													}
												>
													<td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
														{item.id}
													</td>
													<td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
														{item.customer}
													</td>
													<td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
														{item.address}
													</td>
													<td className='whitespace-nowrap px-6 py-4 text-sm'>
														<span
															className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${item.statusClass}`}
														>
															{t(
																`deliveryman.deliveriess.${item.status}`
															)}
														</span>
													</td>
													<td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
														{item.date}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

// Composant d'icône d'utilisateur
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns='http://www.w3.org/2000/svg'
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
			<circle cx='12' cy='7' r='4' />
		</svg>
	);
}

// Composant d'icône d'utilisateur
function User(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns='http://www.w3.org/2000/svg'
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
			<circle cx='12' cy='7' r='4' />
		</svg>
	);
}

// Composant d'icône d'horloge
function Clock(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns='http://www.w3.org/2000/svg'
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<circle cx='12' cy='12' r='10' />
			<polyline points='12 6 12 12 16 14' />
		</svg>
	);
}
