'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CommercialList from '@/components/feature/Backend/Commercial/CommercialList';
import ContactDetails from '@/components/feature/Backend/Commercial/ContactDetails';
import { useCommercialLayout } from '@/components/feature/Backend/Commercial/CommercialLayoutConfig';
import { PageContentLayout } from '@/components/ui/organisms';
import { useCommercialContacts } from '@/hooks';
import { getErrorMessage } from '@/lib/utils';
import { useAlert } from '@/components/providers/AlertProvider';
import { getCommercialContactById } from '@/lib/supabase/commercial';
import type { CommercialContact } from '@/types/commercial';

export default function CommercialPage() {
  const searchParams = useSearchParams();
  const contactIdFromUrl = searchParams.get('contactId');

  const { activeSection } = useCommercialLayout();
  const { setAlert } = useAlert();
  const { contacts, isLoading, error, refetch, updateContactInPlace } = useCommercialContacts();
  const [selectedContact, setSelectedContact] = useState<CommercialContact | null>(null);
  const [isContactDetailsOpen, setIsContactDetailsOpen] = useState(false);

  const errorMessage = error ? getErrorMessage(error) : null;
  const isConfigError = errorMessage ? /relation.*does not exist|permission denied|JWT/i.test(errorMessage) : false;
  const alertMessage = errorMessage
    ? isConfigError
      ? 'Base de données non configurée. Exécutez les migrations SQL dans Supabase (voir supabase/migrations/).'
      : `Impossible de charger les contacts : ${errorMessage}`
    : null;

  useEffect(() => {
    if (contactIdFromUrl) {
      getCommercialContactById(contactIdFromUrl).then((contact) => {
        if (contact) {
          setSelectedContact(contact);
          setIsContactDetailsOpen(true);
        }
      });
    }
  }, [contactIdFromUrl]);

  useEffect(() => {
    if (alertMessage) {
      setAlert({
        variant: 'error',
        message: alertMessage,
        onDismiss: () => {
          setAlert(null);
          refetch();
        },
      });
    } else {
      setAlert(null);
    }
    return () => setAlert(null);
  }, [alertMessage, setAlert, refetch]);

  return (
    <PageContentLayout embedded>
      <div className="space-y-6">
        {activeSection === 'contacts' && (
          <CommercialList
            contacts={contacts}
            isLoading={isLoading}
            onRefetch={async () => { await refetch(); }}
            onContactUpdate={updateContactInPlace}
          />
        )}
      </div>

      <ContactDetails
        isOpen={isContactDetailsOpen}
        onClose={() => {
          setIsContactDetailsOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
      />
    </PageContentLayout>
  );
}
