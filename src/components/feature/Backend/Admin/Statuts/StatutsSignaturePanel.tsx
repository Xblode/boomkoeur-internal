'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import { PenTool, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useOrg, useUser } from '@/hooks';
import {
  getStatuts,
  getSignatures,
} from '@/lib/supabase/associationStatuts';
import { signatureService } from '@/lib/services/SignatureService';
import type { AssociationStatut, StatutSignature } from '@/types/associationStatuts';

export default function StatutsSignaturePanel() {
  const { activeOrg } = useOrg();
  const { user } = useUser();
  const [pendingStatut, setPendingStatut] = useState<AssociationStatut | null>(null);
  const [mySignature, setMySignature] = useState<StatutSignature | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeOrg || !user) return;
    loadSignatureData();
  }, [activeOrg?.id, user?.id]);

  async function loadSignatureData() {
    try {
      setIsLoading(true);
      const all = await getStatuts();
      const pending = all.find((s) => s.status === 'pending_signatures');
      setPendingStatut(pending ?? null);

      if (pending && user) {
        const sigs = await getSignatures(pending.id);
        const mine = sigs.find((s) => s.userId === user.id);
        setMySignature(mine ?? null);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSign() {
    if (!pendingStatut || !mySignature || !user) return;
    setIsSigning(true);
    try {
      await signatureService.sign({
        statutVersionId: pendingStatut.id,
        userId: user.id,
        signatureId: mySignature.id,
      });
      toast.success('Document signé avec succès');
      setMySignature({ ...mySignature, signedAt: new Date() });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la signature');
    } finally {
      setIsSigning(false);
    }
  }

  if (isLoading || !pendingStatut || !mySignature) return null;

  const alreadySigned = !!mySignature.signedAt;

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          {alreadySigned ? (
            <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h3 className="text-sm font-medium">
              {alreadySigned
                ? 'Vous avez signé les nouveaux statuts'
                : 'Signature requise — Nouveaux statuts'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {alreadySigned
                ? `Signé le ${new Date(mySignature.signedAt!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'Les statuts modifiés ont été validés en Assemblée Générale. Votre signature électronique est requise.'}
            </p>
            {!alreadySigned && (
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={handleSign}
                disabled={isSigning}
              >
                <PenTool size={14} className="mr-1" />
                {isSigning ? 'Signature en cours...' : 'Signer le document'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
