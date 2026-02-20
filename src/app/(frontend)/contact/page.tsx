import { ContactForm } from '@/components/feature/Frontend/Contact';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez-nous pour toute question ou demande',
};

export default function ContactPage() {
  return (
    <>
      <ContactForm />
    </>
  );
}
