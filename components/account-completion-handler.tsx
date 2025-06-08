import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AccountCompletionHandlerProps {
	completedAccountType: 'DeliveryMan' | 'ServiceProvider' | 'Shopkeeper';
}

export default function AccountCompletionHandler({
	completedAccountType,
}: AccountCompletionHandlerProps) {
	const router = useRouter();

	useEffect(() => {
		const handleNextStep = () => {
			const stored = sessionStorage.getItem('signupInfo');
			if (!stored) return;

			const { selectedAccounts } = JSON.parse(stored);
			const remainingAccounts = selectedAccounts.filter(
				(type: string) =>
					type !== 'Client' && type !== completedAccountType
			);

			if (remainingAccounts.includes('ServiceProvider')) {
				router.push('/documents-verification/service-provider');
			} else if (remainingAccounts.includes('Shopkeeper')) {
				router.push('/documents-verification/shopkeeper');
			} else if (remainingAccounts.includes('DeliveryMan')) {
				router.push('/documents-verification/deliveryman');
			} else {
				router.push(
					`/documents-verification/pending-validation/${completedAccountType.toLowerCase()}`
				);
			}
		};

		handleNextStep();
	}, [completedAccountType, router]);

	return null;
}
