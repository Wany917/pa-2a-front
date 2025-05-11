'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
	User,
	ChevronDown,
	Edit,
	LogOut,
	Send,
	Search,
	Phone,
	Video,
	Info,
	ArrowLeft,
	X,
	Plus,
} from 'lucide-react';
import LanguageSelector from '@/components/language-selector';
import { useLanguage } from '@/components/language-context';
import { useWebSocket } from '@/contexts/websocket-context';

// Types for our data
interface Message {
	id: string;
	senderId: string;
	senderName: string;
	content: string;
	timestamp: string;
	isRead: boolean;
	isFromUser: boolean;
}

interface Conversation {
	id: string;
	recipientId: string;
	recipientName: string;
	recipientAvatar: string;
	recipientType: 'delivery' | 'service';
	serviceType?: string;
	lastMessage: string;
	lastMessageTime: string;
	unreadCount: number;
	messages: Message[];
	status: 'online' | 'offline' | 'away';
}

export default function MessagesPage() {
	const [first_name, setUserName] = useState('');
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<'all' | 'delivery' | 'service'>(
		'all'
	);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedConversation, setSelectedConversation] = useState<
		string | null
	>(null);
	const [newMessage, setNewMessage] = useState('');
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [userId, setUserId] = useState<number | null>(null);
	// State for new conversation modal
	const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
		useState(false);
	const [availableUsers, setAvailableUsers] = useState<any[]>([]);
	const [selectedUser, setSelectedUser] = useState<string | null>(null);
	const [initialMessage, setInitialMessage] = useState('');

	const { t } = useLanguage();
	const { isConnected, connect, on, emit } = useWebSocket();

	// State for conversations
	const [conversations, setConversations] = useState<Conversation[]>([]);
	// State for loading
	const [isLoading, setIsLoading] = useState(true);
	// State for error
	const [error, setError] = useState<string | null>(null);

	// Fetch conversations from API
	useEffect(() => {
		const fetchConversations = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// Import messageService
				const { messageService } = await import(
					'@/services/messageService'
				);

				// Fetch conversations
				const conversationsData =
					await messageService.getConversations();

				// Transform the data to match our Conversation interface
				const formattedConversations = conversationsData.map(
					(conv: any) => {
						return {
							id: conv.id.toString(),
							recipientId: conv.recipient_id
								? conv.recipient_id.toString()
								: '',
							recipientName:
								conv.recipient_name || 'Unknown User',
							recipientAvatar:
								conv.recipient_avatar ||
								'/placeholder.svg?height=40&width=40',
							recipientType: conv.recipient_type || 'service',
							serviceType: conv.service_type,
							lastMessage: conv.last_message || 'No messages yet',
							lastMessageTime:
								conv.last_message_time ||
								new Date().toISOString(),
							unreadCount: conv.unread_count || 0,
							status: conv.status || 'offline',
							messages: [],
						};
					}
				);

				setConversations(formattedConversations);
			} catch (err: any) {
				console.error('Error fetching conversations:', err);
				setError(err.message || 'Failed to load conversations');
			} finally {
				setIsLoading(false);
			}
		};

		if (userId) {
			fetchConversations();
		}
	}, [userId]);

	// Filter conversations based on active tab and search query
	const filteredConversations = conversations.filter((conversation) => {
		// Filter by type
		if (
			activeTab === 'delivery' &&
			conversation.recipientType !== 'delivery'
		)
			return false;
		if (activeTab === 'service' && conversation.recipientType !== 'service')
			return false;

		// Filter by search query
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			return (
				conversation.recipientName.toLowerCase().includes(query) ||
				(conversation.serviceType &&
					conversation.serviceType.toLowerCase().includes(query))
			);
		}

		return true;
	});

	// Get the selected conversation
	const currentConversation = conversations.find(
		(c) => c.id === selectedConversation
	);

	// Handle sending a new message
	const handleSendMessage = async () => {
		if (!newMessage.trim()) return;

		try {
			// Import messageService
			const { messageService } = await import(
				'@/services/messageService'
			);

			// Create new message
			const newMsg: Message = {
				id: `m${Date.now()}`,
				senderId: 'user',
				senderName: 'You',
				content: newMessage,
				timestamp: new Date().toISOString(),
				isRead: true,
				isFromUser: true,
			};

			if (selectedConversation) {
				// Send message to existing conversation via WebSocket
				if (isConnected) {
					emit('send_message', {
						conversationId: selectedConversation,
						message: newMsg,
					});
				}

				const updatedConversations = conversations.map(
					(conversation) => {
						if (conversation.id === selectedConversation) {
							// Update conversation
							return {
								...conversation,
								lastMessage: newMessage,
								lastMessageTime: new Date().toISOString(),
								messages: [...conversation.messages, newMsg],
							};
						}
						return conversation;
					}
				);

				setConversations(updatedConversations);
			} else {
				// Create a new conversation with the selected user
				// This would typically come from a user selection UI
				// For now, we'll just show an alert that this feature is not implemented
				alert(
					'Please select a conversation first or use the "New Message" feature to start a conversation.'
				);
				return;
			}

			setNewMessage('');
		} catch (err) {
			console.error('Error sending message:', err);
			alert('Failed to send message. Please try again.');
		}
	};

	// Mark messages as read when conversation is selected
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
				setUserId(data.id);
			})
			.catch((err) => console.error('Auth/me failed:', err));
	}, []);

	// Connect to WebSocket when userId is available
	useEffect(() => {
		if (userId && !isConnected) {
			connect(userId);
		}
	}, [userId, isConnected, connect]);

	// Listen for incoming messages
	useEffect(() => {
		if (!isConnected) return;

		const unsubscribe = on('receive_message', (data: any) => {
			const { conversationId, message } = data;

			setConversations((prevConversations) => {
				return prevConversations.map((conversation) => {
					if (conversation.id === conversationId) {
						return {
							...conversation,
							lastMessage: message.content,
							lastMessageTime: message.timestamp,
							messages: [...conversation.messages, message],
							unreadCount:
								conversation.id !== selectedConversation
									? conversation.unreadCount + 1
									: 0,
						};
					}
					return conversation;
				});
			});
		});

		return unsubscribe;
	}, [isConnected, on, selectedConversation]);

	useEffect(() => {
		if (selectedConversation) {
			setConversations((prevConversations) =>
				prevConversations.map((conversation) => {
					if (conversation.id === selectedConversation) {
						return {
							...conversation,
							unreadCount: 0,
							messages: conversation.messages.map((message) => ({
								...message,
								isRead: true,
							})),
						};
					}
					return conversation;
				})
			);
		}
	}, [selectedConversation]);

	// Scroll to bottom of messages when a new message is added
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [currentConversation?.messages]);

	// Handle creating a new conversation
	const handleCreateConversation = async () => {
		if (!selectedUser || !initialMessage.trim()) {
			alert(t('messages.fillAllFields') || 'Please select a user and enter a message');
			return;
		}

		try {
			// Import messageService
			const { messageService } = await import('@/services/messageService');

			// Create the conversation
			await messageService.createConversation(parseInt(selectedUser), initialMessage);

			// Close the modal and reset fields
			setIsNewConversationModalOpen(false);
			setSelectedUser(null);
			setInitialMessage('');

			// Refresh conversations list
			const conversationsData = await messageService.getConversations();
			
			// Transform the data to match our Conversation interface
			const formattedConversations = conversationsData.map((conv: any) => {
				return {
					id: conv.id.toString(),
					recipientId: conv.recipient_id ? conv.recipient_id.toString() : '',
					recipientName: conv.recipient_name || 'Unknown User',
					recipientAvatar: conv.recipient_avatar || '/placeholder.svg?height=40&width=40',
					recipientType: conv.recipient_type || 'service',
					serviceType: conv.service_type,
					lastMessage: conv.last_message || 'No messages yet',
					lastMessageTime: conv.last_message_time || new Date().toISOString(),
					unreadCount: conv.unread_count || 0,
					status: conv.status || 'offline',
					messages: [],
				};
			});

			setConversations(formattedConversations);
		} catch (err) {
			console.error('Error creating conversation:', err);
			alert(t('messages.errorCreatingConversation') || 'Failed to create conversation. Please try again.');
		}
	};

	// Format date for display
	const formatMessageDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);

		// Check if date is today
		if (date.toDateString() === now.toDateString()) {
			return date.toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			});
		}

		// Check if date is yesterday
		if (date.toDateString() === yesterday.toDateString()) {
			return `Yesterday, ${date.toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			})}`;
		}

		// Otherwise return full date
		return date.toLocaleDateString([], {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Get status indicator color
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'online':
				return 'bg-green-500';
			case 'away':
				return 'bg-yellow-500';
			default:
				return 'bg-gray-400';
		}
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* New Conversation Modal */}
			{isNewConversationModalOpen && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
						<div className='flex justify-between items-center p-4 border-b'>
							<h2 className='text-lg font-semibold'>{t('messages.newConversation') || 'New Conversation'}</h2>
							<button 
								className='text-gray-500 hover:text-gray-700'
								onClick={() => setIsNewConversationModalOpen(false)}
							>
								<X className='h-5 w-5' />
							</button>
						</div>
						<div className='p-4'>
							<div className='mb-4'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									{t('messages.selectUser') || 'Select User'}
								</label>
								<select
									className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
									value={selectedUser || ''}
									onChange={(e) => setSelectedUser(e.target.value)}
								>
									<option value=''>{t('messages.selectUser') || 'Select a user...'}</option>
									{availableUsers.map((user) => (
										<option key={user.id} value={user.id}>
											{user.first_name} {user.last_name} ({user.type})
										</option>
									))}
								</select>
							</div>
							<div className='mb-4'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									{t('messages.message') || 'Message'}
								</label>
								<textarea
									className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]'
									value={initialMessage}
									onChange={(e) => setInitialMessage(e.target.value)}
									placeholder={t('messages.typeMessage') || 'Type your message...'}
								></textarea>
							</div>
							<div className='flex justify-end'>
								<button
									className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors mr-2'
									onClick={() => setIsNewConversationModalOpen(false)}
								>
									{t('common.cancel') || 'Cancel'}
								</button>
								<button
									className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors'
									onClick={handleCreateConversation}
								>
									{t('common.send') || 'Send'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Header */}
			<header className='bg-white shadow-sm'>
				<div className='container mx-auto px-4 py-3 flex items-center justify-between'>
					<div className='flex items-center'>
						<Link href='/app_client'>
							<Image
								src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-NEF7Y3VVan4gaPKz0Ke4Q9FTKCgie4.png'
								alt='EcoDeli Logo'
								width={120}
								height={40}
								className='h-auto'
							/>
						</Link>
					</div>

					<nav className='hidden md:flex items-center space-x-6'>
						<Link
							href='/app_client/announcements'
							className='text-gray-700 hover:text-green-500'
						>
							{t('navigation.myAnnouncements')}
						</Link>
						<Link
							href='/app_client/payments'
							className='text-gray-700 hover:text-green-500'
						>
							{t('navigation.myPayments')}
						</Link>
						<Link
							href='/app_client/messages'
							className='text-green-500 font-medium border-b-2 border-green-500'
						>
							{t('navigation.messages')}
						</Link>
						<Link
							href='/app_client/complaint'
							className='text-gray-700 hover:text-green-500'
						>
							{t('navigation.makeComplaint')}
						</Link>
					</nav>

					<div className='flex items-center space-x-4'>
						<LanguageSelector />

						{/* User Account Menu */}
						<div className='relative'>
							<button
								className='flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors'
								onClick={() =>
									setIsUserMenuOpen(!isUserMenuOpen)
								}
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
			</header>

			{/* Main Content */}
			<main className='container mx-auto px-4 py-8'>
				<h1 className='text-2xl sm:text-3xl font-semibold text-center text-green-400 mb-8'>
					{t('messages.yourMessages')}
				</h1>

				<div className='bg-white rounded-lg shadow-md overflow-hidden'>
					<div className='flex flex-col md:flex-row h-[calc(80vh-100px)]'>
						{/* Conversations List */}
						<div
							className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${
								selectedConversation ? 'hidden md:flex' : 'flex'
							}`}
						>
							{/* Search and Filter */}
							<div className='p-4 border-b border-gray-200'>
								<div className='flex justify-between items-center mb-4'>
									<div className='relative flex-1 mr-2'>
										<input
											type='text'
											placeholder={t(
												'messages.searchConversations'
											)}
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
											className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
										/>
										<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
									</div>
									<button
										className='bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center'
										onClick={() => {
											setIsNewConversationModalOpen(true);
											// Fetch available users when opening the modal
											const fetchAvailableUsers = async () => {
												try {
													const { messageService } = await import('@/services/messageService');
													const users = await messageService.getAvailableUsers();
													setAvailableUsers(users || []);
												} catch (err) {
													console.error('Error fetching available users:', err);
												}
											};
											fetchAvailableUsers();
										}}
									>
										<span className='hidden sm:inline'>{t('messages.newConversation') || 'New'}</span>
										<span className='sm:hidden'>+</span>
									</button>
								</div>
								<div className='flex bg-gray-100 rounded-lg p-1'>
									<button
										onClick={() => setActiveTab('all')}
										className={`flex-1 px-4 py-2 text-sm rounded-md ${
											activeTab === 'all'
												? 'bg-white shadow-sm'
												: 'hover:bg-gray-200'
										}`}
									>
										{t('common.all')}
									</button>
									<button
										onClick={() => setActiveTab('delivery')}
										className={`flex-1 px-4 py-2 text-sm rounded-md ${
											activeTab === 'delivery'
												? 'bg-white shadow-sm'
												: 'hover:bg-gray-200'
										}`}
									>
										{t('messages.delivery')}
									</button>
									<button
										onClick={() => setActiveTab('service')}
										className={`flex-1 px-4 py-2 text-sm rounded-md ${
											activeTab === 'service'
												? 'bg-white shadow-sm'
												: 'hover:bg-gray-200'
										}`}
									>
										{t('messages.services')}
									</button>
								</div>
							</div>

							{/* Conversations */}
							<div className='flex-1 overflow-y-auto'>
								{filteredConversations.length > 0 ? (
									filteredConversations.map(
										(conversation) => (
											<div
												key={conversation.id}
												className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
													selectedConversation ===
													conversation.id
														? 'bg-gray-50'
														: ''
												}`}
												onClick={() =>
													setSelectedConversation(
														conversation.id
													)
												}
											>
												<div className='flex items-start'>
													<div className='relative mr-3 flex-shrink-0'>
														<Image
															src={
																conversation.recipientAvatar ||
																'/placeholder.svg'
															}
															alt={
																conversation.recipientName
															}
															width={48}
															height={48}
															className='rounded-full'
														/>
														<span
															className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
																conversation.status
															)}`}
														></span>
													</div>
													<div className='flex-1 min-w-0'>
														<div className='flex justify-between items-start'>
															<h3 className='text-sm font-medium truncate'>
																{
																	conversation.recipientName
																}
															</h3>
															<span className='text-xs text-gray-500'>
																{
																	formatMessageDate(
																		conversation.lastMessageTime
																	).split(
																		','
																	)[0]
																}
															</span>
														</div>
														{conversation.serviceType && (
															<p className='text-xs text-green-500 mb-1'>
																{
																	conversation.serviceType
																}
															</p>
														)}
														<p className='text-sm text-gray-600 truncate'>
															{
																conversation.lastMessage
															}
														</p>
													</div>
													{conversation.unreadCount >
														0 && (
														<div className='ml-2 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
															{
																conversation.unreadCount
															}
														</div>
													)}
												</div>
											</div>
										)
									)
								) : (
									<div className='p-4 text-center text-gray-500'>
										{t('messages.noConversations')}
									</div>
								)}
							</div>
						</div>

						{/* Conversation Detail */}
						<div
							className={`w-full md:w-2/3 flex flex-col ${
								!selectedConversation
									? 'hidden md:flex'
									: 'flex'
							}`}
						>
							{!currentConversation ? (
								<div className='flex-1 flex items-center justify-center p-4 text-gray-500'>
									<div className='text-center'>
										<div className='mb-4'>
											<Image
												src='/placeholder.svg?height=100&width=100'
												alt={t(
													'messages.selectConversation'
												)}
												width={100}
												height={100}
												className='mx-auto opacity-50'
											/>
										</div>
										<p>
											{t('messages.selectConversation')}
										</p>
									</div>
								</div>
							) : (
								<>
									{/* Conversation Header */}
									<div className='p-4 border-b border-gray-200 flex items-center'>
										<button
											className='md:hidden mr-2 text-gray-500'
											onClick={() =>
												setSelectedConversation(null)
											}
										>
											<ArrowLeft className='h-5 w-5' />
										</button>
										<div className='relative mr-3'>
											<Image
												src={
													currentConversation.recipientAvatar ||
													'/placeholder.svg'
												}
												alt={
													currentConversation.recipientName
												}
												width={40}
												height={40}
												className='rounded-full'
											/>
											<span
												className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(
													currentConversation.status
												)}`}
											></span>
										</div>
										<div className='flex-1'>
											<h3 className='font-medium'>
												{
													currentConversation.recipientName
												}
											</h3>
											<p className='text-xs text-gray-500'>
												{currentConversation.status ===
												'online'
													? t('messages.online')
													: currentConversation.status ===
													  'away'
													? t('messages.away')
													: t('messages.offline')}
											</p>
										</div>
									</div>

									{/* Messages */}
									<div className='flex-1 p-4 overflow-y-auto bg-gray-50'>
										<div className='space-y-4'>
											{currentConversation.messages.map(
												(message) => (
													<div
														key={message.id}
														className={`flex ${
															message.isFromUser
																? 'justify-end'
																: 'justify-start'
														}`}
													>
														<div
															className={`max-w-[75%] rounded-lg px-4 py-2 ${
																message.isFromUser
																	? 'bg-green-50 text-white'
																	: 'bg-white border border-gray-200 text-gray-800'
															}`}
														>
															<div className='flex justify-between items-center mb-1'>
																<span className='font-medium text-sm'>
																	{
																		message.senderName
																	}
																</span>
																<span className='text-xs text-opacity-80 ml-2'>
																	{formatMessageDate(
																		message.timestamp
																	).split(
																		','
																	)[1] ||
																		formatMessageDate(
																			message.timestamp
																		)}
																</span>
															</div>
															<p className='text-sm'>
																{
																	message.content
																}
															</p>
														</div>
													</div>
												)
											)}
											<div ref={messagesEndRef} />
										</div>
									</div>

									{/* Message Input */}
									<div className='p-4 border-t border-gray-200'>
										<div className='flex items-center'>
											<input
												type='text'
												placeholder={t(
													'messages.typeMessage'
												)}
												value={newMessage}
												onChange={(e) =>
													setNewMessage(
														e.target.value
													)
												}
												onKeyPress={(e) =>
													e.key === 'Enter' &&
													handleSendMessage()
												}
												className='flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500'
											/>
											<button
												onClick={handleSendMessage}
												disabled={!newMessage.trim()}
												className='px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600 transition-colors disabled:opacity-50'
											>
												<Send className='h-5 w-5' />
											</button>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}