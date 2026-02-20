import { LoginForm } from '@/components/feature/Frontend/Auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte',
};

export default function LoginPage() {
  return <LoginForm />;
}
