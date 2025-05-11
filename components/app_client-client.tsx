'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, User, LogOut, Edit, ChevronDown } from 'lucide-react';
import { Cantata_One as Sansita_One } from 'next/font/google';
import LanguageSelector from '@/components/language-selector';
import { useLanguage } from '@/components/language-context';
import OnboardingOverlay from '@/components/onboarding-overlay';

const sansitaOne = Sansita_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
});

interface Service {
	id: number;
	title: string;
	image: string;
	description: string;
	price: string;
	rating: number;
}

export default function app_clientClient() {
	const { t } = useLanguage();
	const [searchQuery, setSearchQuery] = useState('');
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [showOnboarding, setShowOnboarding] = useState(false);
	const userMenuRef = useRef<HTMLDivElement>(null);
	const [userName, setUserName] = useState<string>('');
	const [services, setServices] = useState<Service[]>([
		{
			id: 1,
			title: t('services.babySitter'),
			image: '/baby-sitter.jpg',
			description: t('services.babySitterDesc'),
			price: '£17/hour',
			rating: 5,
		},
		{
			id: 2,
			title: t('services.dogSitter'),
			image: '/dog-sitter.jpg',
			description: t('services.dogSitterDesc'),
			price: '£20/hour',
			rating: 5,
		},
		{
			id: 3,
			title: t('services.airportRide'),
			image: '/airport-ride.jpg',
			description: t('services.airportRideDesc'),
			price: '£30 + £2/km',
			rating: 5,
		},
	]);
	const [isLoading, setIsLoading] = useState(false);

	// Fermer le menu quand on clique en dehors
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				userMenuRef.current &&
				!userMenuRef.current.contains(event.target as Node)
			) {
				setIsUserMenuOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Récupérer le nom de l'utilisateur
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
				setUserName(data.firstName);
			})
			.catch((err) => console.error('Auth/me failed:', err));
	}, []);

	// Affichage de l'overlay si première connexion
	useEffect(() => {
		const hasCompletedOnboarding = localStorage.getItem(
			'ecodeli-onboarding-completed'
		);
		if (!hasCompletedOnboarding) {
			setShowOnboarding(true);
		}
	}, []);

	// Récupération des services depuis l'API
	useEffect(() => {
		const fetchServices = async () => {
			// On utilise le flag isLoading mais on ne l'affiche pas dans l'UI
			// puisque nous avons déjà des données statiques
			setIsLoading(true);
			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
				
				if (response.ok) {
					const data = await response.json();
					
					if (Array.isArray(data) && data.length > 0) {
						const formattedServices: Service[] = data.map((service: any) => ({
							id: service.id,
							title: service.title || t("services.defaultTitle"),
							image: service.image || '/placeholder.svg',
							description: service.description || '',
							price: `£${service.price || '0'}`,
							rating: service.rating || 5
						}));
						
						setServices(formattedServices);
					}
					// Si aucune donnée n'est retournée, on garde les services statiques par défaut
				}
				// Si l'API échoue, on garde les services statiques par défaut
			} catch (error) {
				console.error("Error fetching services:", error);
				// On garde les services statiques par défaut en cas d'erreur
			} finally {
				setIsLoading(false);
			}
		};
		
		fetchServices();
	}, [t]);

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Onboarding overlay */}
			{showOnboarding && (
				<OnboardingOverlay
					onComplete={() => {
						localStorage.setItem(
							'ecodeli-onboarding-completed',
							'true'
						);
						setShowOnboarding(false);
					}}
				/>
			)}

			{/* Header */}
			<header className='bg-white shadow-sm'>
				<div className='container mx-auto px-4 py-3 flex items-center justify-between'>
					<div className='flex items-center'>
						<Link href='/app_client'>
							<Image
								src='/logo.png'
								alt='EcoDeli Logo'
								width={120}
								height={40}
								className='h-auto'
							/>
						</Link>
					</div>

					{/* Mobile menu button */}
					<button
						className='md:hidden flex items-center'
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-6 w-6'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d={
									isMobileMenuOpen
										? 'M6 18L18 6M6 6l12 12'
										: 'M4 6h16M4 12h16M4 18h16'
								}
							/>
						</svg>
					</button>

					<nav className='hidden md:flex items-center space-x-6'>
						<Link
							href='/app_client/announcements'
							className='text-gray-700 hover:text-green-50'
						>
							{t('navigation.myAnnouncements')}
						</Link>
						<Link
							href='/app_client/payments'
							className='text-gray-700 hover:text-green-50'
						>
							{t('navigation.myPayments')}
						</Link>
						<Link
							href='/app_client/messages'
							className='text-gray-700 hover:text-green-50'
						>
							{t('navigation.messages')}
						</Link>
						<Link
							href='/app_client/complaint'
							className='text-gray-700 hover:text-green-50'
						>
							{t('navigation.makeComplaint')}
						</Link>
					</nav>

					<div className='flex items-center space-x-4'>
						<LanguageSelector />

						{/* User Account Menu */}
						<div className='relative' ref={userMenuRef}>
							<button
								className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
								onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
							>
								<User className="h-5 w-5 mr-2" />
								<span className="hidden sm:inline">{userName || t("common.loading")}</span>
								<ChevronDown className="h-4 w-4 ml-1" />
							</button>

							{isUserMenuOpen && (
								<div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100'>
									<Link
										href='/app_client/edit-account'
										className='flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100'
									>
										<Edit className='h-4 w-4 mr-2' />
										<span>{t('common.editAccount')}</span>
									</Link>

									<div className='border-t border-gray-100 my-1'></div>

									<div className='px-4 py-1 text-xs text-gray-500'>
										{t('common.registerAs')}
									</div>

									<Link
										href='/register/delivery-man'
										className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
									>
										{t('common.deliveryMan')}
									</Link>

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
				</div>

				{/* Mobile menu */}
				{isMobileMenuOpen && (
					<div className='md:hidden bg-white border-t border-gray-100 py-2'>
						<div className='container mx-auto px-4'>
							<Link
								href='/app_client/announcements'
								className='block py-2 text-gray-700 hover:text-green-50'
							>
								{t('navigation.myAnnouncements')}
							</Link>
							<Link
								href='/app_client/payments'
								className='block py-2 text-gray-700 hover:text-green-50'
							>
								{t('navigation.myPayments')}
							</Link>
							<Link
								href='/app_client/messages'
								className='block py-2 text-gray-700 hover:text-green-50'
							>
								{t('navigation.messages')}
							</Link>
							<Link
								href='/app_client/complaint'
								className='block py-2 text-gray-700 hover:text-green-50'
							>
								{t('navigation.makeComplaint')}
							</Link>
						</div>
					</div>
				)}
			</header>

			{/* Main Content */}
			<main className='container mx-auto px-4 py-8'>
				<h1
					className={`text-2xl sm:text-3xl text-center text-green-50 mb-8 ${sansitaOne.className}`}
				>
					{t('app_client.welcome')}
				</h1>

				{/* Search Bar */}
				<div className='max-w-xl mx-auto mb-8 sm:mb-12'>
					<div className='relative'>
						<input
							type='text'
							placeholder={t('app_client.searchServices')}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='w-full py-3 px-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50'
						/>
						<Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
					</div>
				</div>

				{/* Featured Services */}
				<h2
					className={`text-xl sm:text-2xl text-center text-green-50 mb-8 ${sansitaOne.className}`}
				>
					{t('app_client.featuredServices')}
				</h2>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8'>
					{services.map((service) => (
						<div
							key={service.id}
							className='bg-white rounded-lg shadow-md overflow-hidden'
						>
							<div className='h-48 sm:h-64 relative'>
								<Image
									src={service.image || '/placeholder.svg'}
									alt={service.title}
									fill
									className='object-cover'
								/>
							</div>

							<div className='p-4 sm:p-6'>
								<div className='flex justify-between items-start mb-2'>
									<h3 className='text-lg sm:text-xl font-semibold'>
										{service.title}
									</h3>
									<div className='flex'>
										{[...Array(service.rating)].map(
											(_, i) => (
												<Star
													key={i}
													className='h-4 w-4 fill-current text-yellow-400'
												/>
											)
										)}
									</div>
								</div>

								<p className='text-gray-600 mb-4'>
									{service.description}
								</p>

								<div className='flex flex-col sm:flex-row justify-between items-center gap-2'>
									<div className='bg-green-100 text-green-50 rounded-full px-4 py-1'>
										{service.price}
									</div>

									<Link
										href={`/app_client/service/${service.id}`}
										className='bg-green-50 text-white rounded-full px-6 py-1 hover:bg-green-400 transition-colors'
									>
										{t('app_client.details')}
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
