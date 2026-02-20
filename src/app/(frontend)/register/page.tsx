import { RegisterForm } from '@/components/feature/Frontend/Auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inscription',
  description: 'Créez votre compte',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
