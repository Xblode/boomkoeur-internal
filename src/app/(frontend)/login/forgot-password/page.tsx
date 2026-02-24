import { ForgotPasswordForm } from '@/components/feature/Frontend/Auth/ForgotPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description: 'Réinitialisez votre mot de passe',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
