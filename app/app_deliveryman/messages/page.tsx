'use client';

import { useLanguage } from '@/components/language-context';
import Messages from '@/components/messages/Messages';
import DeliverymanLayout from '@/components/deliveryman/layout';

export default function MessagesPage() {
	const { t } = useLanguage();

	return (
		<DeliverymanLayout>
			<div className='p-6'>
				<div className='mb-6'>
					<h1 className='text-2xl font-bold text-gray-900'>
						{t("messages.yourMessages")}
					</h1>
				</div>
				<Messages
					userType="deliveryman"
					apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || ''}
					navigationLinks={[
						{ href: '/app_deliveryman/deliveries', label: 'deliveryman.deliveries' },
						{ href: '/app_deliveryman/notifications', label: 'deliveryman.notifications' },
						{ href: '/app_deliveryman/messages', label: 'deliveryman.messages', active: true },
						{ href: '/app_deliveryman/payments', label: 'deliveryman.payments' },
						{ href: '/app_deliveryman/announcements', label: 'deliveryman.announcements' }
					]}
					editAccountUrl="/app_deliveryman/edit-account"
					registerLinks={[
						{ href: '/register/shopkeeper', label: 'common.shopkeeper' },
						{ href: '/register/service-provider', label: 'common.serviceProvider' }
					]}
					hideNavigation={true}
				/>
			</div>
		</DeliverymanLayout>
	);
}
