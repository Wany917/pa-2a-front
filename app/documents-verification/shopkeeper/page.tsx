'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/language-context';

export default function ShopkeeperDocumentsPage() {
	const { t } = useLanguage();
	const router = useRouter();

	const [formData, setFormData] = useState({
		siret: '',
		siren: '',
	});
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const isAtLeastOneFieldFilled = (): boolean => {
		return Object.values(formData).some((value) => value.trim() !== '');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(''); // Réinitialiser l'erreur

		if (!isAtLeastOneFieldFilled()) {
			setError(t('auth.atLeastOneFieldRequired') || "Please fill at least one field");
			return;
		}

		setIsSubmitting(true);

		try {
      const token =
        sessionStorage.getItem('authToken') ||
        localStorage.getItem('authToken');

      if (!token) {
        setError(t('auth.unauthorized'));
        return;
      }

      const user = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        }
      )
      const userData = await user.json()

			const companySiret = formData.siret || formData.siren;
      const validSiret = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${companySiret}`)
      const validSiretData = await validSiret.json()

      if (validSiretData.total_results === 0) {
        setError(t('auth.invalidSiretOrSiren'));
        return;
      }

      const commercant = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/commercants/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            utilisateur_id: userData.id,
            store_name: validSiretData.results[0].nom_complet,
            contact_number: userData.phoneNumber,
            contract_start_date: new Date().toString(),
            contract_end_date: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ).toString(),
          }),
          credentials: "include",
        }
      )
      const commercantData = await commercant.json()

      if (commercantData.error) {
        console.error('Error submitting documents:', commercantData.error);
        setError(t('auth.submissionFailed'));
        return;
      }

			router.push('/documents-verification/pending-validation/shopkeeper');
		} catch (err) {
			console.error('Error submitting documents:', err);
			setError(t('auth.submissionFailed'));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
			{/* Main Content */}
			<main className='flex-grow container mx-auto px-4 py-8'>
				<div className='max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6'>
					<h2 className='text-xl font-semibold text-center text-green-50 mb-6'>
						{t('shopkeeper.enterSiretOrSiren') || 'Enter your SIRET or SIREN number'}
					</h2>

					{error && (
						<div className='bg-red-50 text-red-500 p-3 rounded-md mb-4 text-center'>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* SIRET */}
						<div>
							<label
								htmlFor='siret'
								className='block text-gray-700 mb-2'
							>
								{t('shopkeeper.siretNumber')}
							</label>
							<input
								id='siret'
								name='siret'
								type='text'
								value={formData.siret}
								onChange={handleChange}
								placeholder={t('shopkeeper.enterSiretNumber')}
								className='w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500'
							/>
						</div>

						{/* SIREN */}
						<div>
							<label
								htmlFor='siren'
								className='block text-gray-700 mb-2'
							>
								{t('shopkeeper.sirenNumber')}
							</label>
							<input
								id='siren'
								name='siren'
								type='text'
								value={formData.siren}
								onChange={handleChange}
								placeholder={t('shopkeeper.enterSirenNumber')}
								className='w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500'
							/>
						</div>

						{/* Submit Button */}
						<button
							type='submit'
							disabled={isSubmitting}
							className={`w-full py-3 rounded-md text-white ${
								isSubmitting
									? 'bg-gray-300 cursor-not-allowed'
									: 'bg-green-50 hover:bg-green-500'
							}`}
						>
							{isSubmitting
								? t('auth.submitting')
								: t('common.submit')}
						</button>
					</form>
				</div>
			</main>
		</div>
	);
}