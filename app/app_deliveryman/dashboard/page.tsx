"use client"

import DeliverymanLayout from '@/components/deliveryman/layout';
import { DeliverymanDashboard } from '@/components/deliveryman/dashboard';

export default function DashboardPage() {
	return (
		<DeliverymanLayout>
			<DeliverymanDashboard />
		</DeliverymanLayout>
	);
}