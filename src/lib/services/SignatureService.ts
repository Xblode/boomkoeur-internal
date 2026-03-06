/**
 * SignatureService - Abstraction pour la signature électronique
 *
 * Ce service fournit une interface unifiée pour les providers de signature
 * (Yousign, DocuSign). Le provider concret sera configuré via les variables
 * d'environnement et les intégrations de l'organisation.
 *
 * Pour l'instant : signature interne (trace BDD). L'intégration Yousign/DocuSign
 * viendra dans une phase ultérieure (webhooks, API calls).
 */

import { signStatut, getSignatures } from '@/lib/supabase/associationStatuts';
import type { StatutSignature } from '@/types/associationStatuts';

export type SignatureProvider = 'yousign' | 'docusign' | 'internal';

export interface SignatureRequest {
  statutVersionId: string;
  userId: string;
  signatureId: string;
}

export interface SignatureResult {
  success: boolean;
  externalId?: string;
  provider: SignatureProvider;
}

class SignatureService {
  private provider: SignatureProvider = 'internal';

  setProvider(provider: SignatureProvider) {
    this.provider = provider;
  }

  /**
   * Signs a statut version for the current user.
   * In internal mode: records signature directly in BDD.
   * In external mode: will redirect to provider's signing page.
   */
  async sign(request: SignatureRequest): Promise<SignatureResult> {
    switch (this.provider) {
      case 'yousign':
        return this.signWithYousign(request);
      case 'docusign':
        return this.signWithDocusign(request);
      case 'internal':
      default:
        return this.signInternal(request);
    }
  }

  private async signInternal(request: SignatureRequest): Promise<SignatureResult> {
    await signStatut(request.signatureId);
    return { success: true, provider: 'internal' };
  }

  private async signWithYousign(_request: SignatureRequest): Promise<SignatureResult> {
    // TODO: Implement Yousign API integration
    // 1. Create signature request via Yousign API
    // 2. Get signing URL
    // 3. Redirect user or open iframe
    // 4. Handle webhook callback to update BDD
    throw new Error('Yousign integration not yet implemented. Configure API keys in Administration > Intégration.');
  }

  private async signWithDocusign(_request: SignatureRequest): Promise<SignatureResult> {
    // TODO: Implement DocuSign API integration
    throw new Error('DocuSign integration not yet implemented. Configure API keys in Administration > Intégration.');
  }

  async getSignatureStatus(statutVersionId: string): Promise<{
    total: number;
    signed: number;
    pending: number;
    signatures: StatutSignature[];
  }> {
    const signatures = await getSignatures(statutVersionId);
    const signed = signatures.filter((s) => s.signedAt).length;
    return {
      total: signatures.length,
      signed,
      pending: signatures.length - signed,
      signatures,
    };
  }

  async isAllSigned(statutVersionId: string): Promise<boolean> {
    const status = await this.getSignatureStatus(statutVersionId);
    return status.total > 0 && status.pending === 0;
  }
}

export const signatureService = new SignatureService();
