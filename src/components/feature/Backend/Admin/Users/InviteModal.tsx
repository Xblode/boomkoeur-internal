'use client';

import { useState, useEffect } from 'react';
import { Copy, Mail, Send } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/organisms/Modal';
import { Button, Input } from '@/components/ui/atoms';
import { FormField } from '@/components/ui/molecules';
import { createInviteLink } from '@/lib/supabase/organisations';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

export default function InviteModal({ isOpen, onClose, orgId }: InviteModalProps) {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen && orgId) {
      setIsLoadingLink(true);
      setInviteLink(null);
      createInviteLink(orgId)
        .then((invite) => {
          setInviteLink(`${typeof window !== 'undefined' ? window.location.origin : ''}/onboarding?invite=${invite.token}`);
        })
        .catch((err) => {
          toast.error(getErrorMessage(err));
          onClose();
        })
        .finally(() => setIsLoadingLink(false));
    }
  }, [isOpen, orgId, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
    }
  }, [isOpen]);

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Lien copié dans le presse-papiers');
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !inviteLink) return;

    const tokenMatch = inviteLink.match(/invite=([^&]+)/);
    const token = tokenMatch ? tokenMatch[1] : '';

    setIsSending(true);
    try {
      const res = await fetch('/api/invite/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), inviteToken: token }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Erreur lors de l\'envoi');
      }
      toast.success('Invitation envoyée', {
        description: `Un email a été envoyé à ${email.trim()} pour rejoindre l'espace.`,
      });
      setEmail('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inviter un membre" size="md">
      <div className="space-y-4">
        <FormField label="Lien d'invitation">
          <div className="flex gap-2">
            <Input
              readOnly
              value={inviteLink ?? (isLoadingLink ? 'Génération...' : '')}
              className="font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              disabled={!inviteLink || isLoadingLink}
              title="Copier le lien"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lien valable 72h. Partagez-le ou envoyez une invitation par email ci-dessous.
          </p>
        </FormField>

        <form onSubmit={handleSendEmail} className="space-y-4">
          <FormField label="Envoyer une invitation par email">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="pl-9"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!inviteLink || isLoadingLink || isSending}
              >
                {isSending ? (
                  'Envoi...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1.5" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </FormField>
        </form>
      </div>
      <ModalFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Fermer
        </Button>
      </ModalFooter>
    </Modal>
  );
}
