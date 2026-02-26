'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { EditableCard } from '@/components/ui/molecules';
import { Button, IconButton, Input, Label, TokenInput } from '@/components/ui/atoms';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/organisms';
import { useOrg } from '@/hooks';
import { Ticket, Share2, Check, Loader2, Key, Copy, Trash2, Cloud, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';

type IntegrationId = 'shotgun' | 'meta';

const INTEGRATIONS: { id: IntegrationId; name: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'shotgun',
    name: 'Shotgun',
    description: 'API de billetterie et gestion des événements',
    icon: <Ticket size={20} className="text-zinc-600 dark:text-zinc-400" />,
  },
  {
    id: 'meta',
    name: 'Instagram',
    description: 'Instagram Business pour publications et statistiques',
    icon: <Share2 size={20} className="text-zinc-600 dark:text-zinc-400" />,
  },
];

export default function AdminIntegrationPage() {
  const { activeOrg, userOrgs, isAdmin, refreshOrgs } = useOrg();
  const searchParams = useSearchParams();
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationId | null>(null);
  const [connectedStatus, setConnectedStatus] = useState<Record<IntegrationId, boolean>>({
    shotgun: false,
    meta: false,
  });
  const [loadingStatus, setLoadingStatus] = useState<Record<IntegrationId, boolean>>({
    shotgun: false,
    meta: false,
  });
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleDisconnecting, setGoogleDisconnecting] = useState(false);
  const [formData, setFormData] = useState({
    organizerId: '',
    apiToken: '',
    clientId: '',
    clientSecret: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; created_at: string }[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [newKeyModal, setNewKeyModal] = useState<{ key: string } | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingKey, setDeletingKey] = useState(false);

  const [googleCalendarIds, setGoogleCalendarIds] = useState<string[]>(() =>
    activeOrg?.googleCalendarId ? activeOrg.googleCalendarId.split(',').map((id) => id.trim()).filter(Boolean) : []
  );
  const [availableCalendars, setAvailableCalendars] = useState<{ id: string; summary: string; primary?: boolean }[]>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(false);
  const [savingCalendarId, setSavingCalendarId] = useState(false);
  const [googleCalendarExpanded, setGoogleCalendarExpanded] = useState(false);
  const [googleConfigExpanded, setGoogleConfigExpanded] = useState(false);
  const [googleConfig, setGoogleConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: '',
  });
  const [savingGoogleConfig, setSavingGoogleConfig] = useState(false);
  const [apiKeysExpanded, setApiKeysExpanded] = useState(false);

  const fetchStatus = async (provider: IntegrationId) => {
    if (!activeOrg?.id) return;
    setLoadingStatus((prev) => ({ ...prev, [provider]: true }));
    try {
      const res = await fetch(`/api/admin/integrations?org_id=${activeOrg.id}&provider=${provider}`);
      const data = await res.json();
      setConnectedStatus((prev) => ({ ...prev, [provider]: data.connected === true }));
    } catch {
      setConnectedStatus((prev) => ({ ...prev, [provider]: false }));
    } finally {
      setLoadingStatus((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const fetchGoogleStatus = useCallback(async () => {
    if (!activeOrg?.id) return;
    setGoogleLoading(true);
    try {
      const res = await fetch(`/api/admin/integrations?org_id=${activeOrg.id}&provider=google`);
      const data = await res.json();
      setGoogleConnected(data.connected === true);
      setGoogleEmail(data.email ?? null);
    } catch {
      setGoogleConnected(false);
      setGoogleEmail(null);
    } finally {
      setGoogleLoading(false);
    }
  }, [activeOrg?.id]);

  const fetchApiKeys = useCallback(async () => {
    if (!activeOrg?.id) return;
    setLoadingKeys(true);
    try {
      const res = await fetch(`/api/admin/integrations/keys?org_id=${activeOrg.id}`);
      const data = await res.json();
      setApiKeys(data.keys ?? []);
    } catch {
      setApiKeys([]);
    } finally {
      setLoadingKeys(false);
    }
  }, [activeOrg?.id]);

  useEffect(() => {
    if (activeOrg?.id) {
      fetchStatus('shotgun');
      fetchStatus('meta');
      fetchGoogleStatus();
      fetchApiKeys();
    }
  }, [activeOrg?.id, fetchApiKeys, fetchGoogleStatus]);

  useEffect(() => {
    setGoogleCalendarIds(
      activeOrg?.googleCalendarId ? activeOrg.googleCalendarId.split(',').map((id) => id.trim()).filter(Boolean) : []
    );
  }, [activeOrg?.googleCalendarId]);

  const fetchGoogleConfig = useCallback(async () => {
    if (!activeOrg?.id) return;
    try {
      const res = await fetch(`/api/admin/integrations/google/config?org_id=${activeOrg.id}`);
      const data = await res.json();
      const baseUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/api/admin/integrations/google/callback`
          : '';
      setGoogleConfig({
        clientId: data.client_id ?? '',
        clientSecret: '', // jamais retourné pour sécurité
        redirectUri: data.redirect_uri ?? baseUrl,
      });
    } catch {
      setGoogleConfig({ clientId: '', clientSecret: '', redirectUri: '' });
    }
  }, [activeOrg?.id]);

  const fetchCalendars = useCallback(async () => {
    if (!activeOrg?.id || !googleConnected) return;
    setLoadingCalendars(true);
    try {
      const res = await fetch(`/api/admin/integrations/google/calendar/list?org_id=${activeOrg.id}`);
      const data = await res.json();
      setAvailableCalendars(data.calendars ?? []);
    } catch {
      setAvailableCalendars([]);
    } finally {
      setLoadingCalendars(false);
    }
  }, [activeOrg?.id, googleConnected]);

  useEffect(() => {
    if (googleConnected && activeOrg?.id) {
      fetchCalendars();
    } else {
      setAvailableCalendars([]);
    }
  }, [googleConnected, activeOrg?.id, fetchCalendars]);

  useEffect(() => {
    const success = searchParams.get('success');
    const errorParam = searchParams.get('error');
    const isPopup = typeof window !== 'undefined' && window.opener;

    if (success === 'google') {
      if (isPopup) {
        window.opener?.postMessage({ type: 'google-oauth', success: true }, window.location.origin);
        window.close();
        return;
      }
      toast.success('Compte Google connecté avec succès');
      fetchGoogleStatus();
      window.history.replaceState({}, '', '/dashboard/admin/integration');
    }
    if (success === 'meta') {
      if (isPopup) {
        window.opener?.postMessage({ type: 'meta-oauth', success: true }, window.location.origin);
        window.close();
        return;
      }
      toast.success('Compte Meta/Instagram connecté avec succès');
      fetchStatus('meta');
      window.history.replaceState({}, '', '/dashboard/admin/integration');
    }
    if (errorParam) {
      if (isPopup) {
        window.opener?.postMessage(
          { type: 'oauth-popup-error', success: false, error: errorParam },
          window.location.origin
        );
        window.close();
        return;
      }
      toast.error(errorParam);
      window.history.replaceState({}, '', '/dashboard/admin/integration');
    }
  }, [searchParams, fetchGoogleStatus]);

  useEffect(() => {
    const handleOAuthMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'google-oauth') {
        if (e.data.success) {
          toast.success('Compte Google connecté avec succès');
          fetchGoogleStatus();
        } else {
          toast.error(e.data.error ?? 'Erreur lors de la connexion Google');
        }
      }
      if (e.data?.type === 'meta-oauth') {
        if (e.data.success) {
          toast.success('Compte Meta/Instagram connecté avec succès');
          fetchStatus('meta');
        } else {
          toast.error(e.data.error ?? 'Erreur lors de la connexion Meta');
        }
      }
      if (e.data?.type === 'oauth-popup-error') {
        toast.error(e.data.error ?? 'Erreur lors de la connexion');
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [fetchGoogleStatus]);

  const handleConnectMeta = () => {
    if (!activeOrg?.id) return;
    const url = `/api/admin/integrations/meta/auth?org_id=${activeOrg.id}`;
    const w = 600;
    const h = 700;
    const left = Math.round((window.screen.width - w) / 2);
    const top = Math.round((window.screen.height - h) / 2);
    window.open(url, 'meta-oauth', `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`);
  };

  const handleConnect = (id: IntegrationId) => {
    if (id === 'meta' && !connectedStatus.meta) {
      handleConnectMeta();
      return;
    }
    if (id === 'meta' && connectedStatus.meta) {
      setSelectedIntegration(id);
      setError(null);
      return;
    }
    setSelectedIntegration(id);
    setFormData({ organizerId: '', apiToken: '', clientId: '', clientSecret: '' });
    setError(null);
  };

  const [metaDisconnecting, setMetaDisconnecting] = useState(false);
  const handleMetaDisconnect = async () => {
    if (!activeOrg?.id) return;
    setMetaDisconnecting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/integrations/meta/disconnect?org_id=${activeOrg.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Erreur');
      }
      setConnectedStatus((prev) => ({ ...prev, meta: false }));
      handleCloseIntegration();
      toast.success('Meta déconnecté');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la déconnexion');
    } finally {
      setMetaDisconnecting(false);
    }
  };

  const handleCloseIntegration = () => {
    setSelectedIntegration(null);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg?.id || !selectedIntegration) return;
    if (selectedIntegration === 'meta') return; // Meta utilise OAuth, pas de sauvegarde manuelle

    setSaving(true);
    setError(null);
    try {
      const credentials =
        selectedIntegration === 'shotgun'
          ? { organizerId: formData.organizerId.trim(), apiToken: formData.apiToken.trim() }
          : { clientId: formData.clientId.trim(), clientSecret: formData.clientSecret.trim() };

      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: activeOrg.id,
          provider: selectedIntegration,
          credentials,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de l\'enregistrement');
        return;
      }
      setConnectedStatus((prev) => ({ ...prev, [selectedIntegration]: true }));
      handleCloseIntegration();
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!activeOrg?.id) return;
    setGeneratingKey(true);
    try {
      const res = await fetch('/api/admin/integrations/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: activeOrg.id, name: 'Clé par défaut' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      setNewKeyModal({ key: data.key });
      fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleCopyKey = () => {
    if (newKeyModal?.key) {
      navigator.clipboard.writeText(newKeyModal.key);
    }
  };

  const handleConnectGoogle = () => {
    if (!activeOrg?.id) return;
    const url = `/api/admin/integrations/google/auth?org_id=${activeOrg.id}`;
    const w = 600;
    const h = 700;
    const left = Math.round((window.screen.width - w) / 2);
    const top = Math.round((window.screen.height - h) / 2);
    window.open(url, 'google-oauth', `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`);
  };

  const handleToggleCalendar = (calendarId: string) => {
    setGoogleCalendarIds((prev) =>
      prev.includes(calendarId) ? prev.filter((id) => id !== calendarId) : [...prev, calendarId]
    );
  };

  const handleSaveGoogleCalendarId = async () => {
    if (!activeOrg?.id) return;
    setSavingCalendarId(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/integrations/google/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: activeOrg.id,
          google_calendar_id: googleCalendarIds.length > 0 ? googleCalendarIds : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de l\'enregistrement');
        return;
      }
      await refreshOrgs();
      toast.success('Calendrier Google configuré');
      setGoogleCalendarExpanded(false);
    } catch {
      setError('Erreur réseau');
    } finally {
      setSavingCalendarId(false);
    }
  };

  const handleSaveGoogleConfig = async () => {
    if (!activeOrg?.id) return;
    setSavingGoogleConfig(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/integrations/google/config?org_id=${activeOrg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: googleConfig.clientId.trim(),
          client_secret: googleConfig.clientSecret || undefined,
          redirect_uri: googleConfig.redirectUri.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'enregistrement");
        return;
      }
      toast.success('Configuration Google enregistrée');
      setGoogleConfigExpanded(false);
    } catch {
      setError('Erreur réseau');
    } finally {
      setSavingGoogleConfig(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!activeOrg?.id) return;
    setGoogleDisconnecting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/integrations/google/disconnect?org_id=${activeOrg.id}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la déconnexion');
        return;
      }
      setGoogleConnected(false);
      setGoogleEmail(null);
      toast.success('Compte Google déconnecté');
    } catch {
      setError('Erreur réseau');
    } finally {
      setGoogleDisconnecting(false);
    }
  };

  const handleConfirmDeleteKey = async () => {
    if (!activeOrg?.id || !keyToDelete) return;
    setDeletingKey(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/integrations/keys?org_id=${activeOrg.id}&key_id=${keyToDelete.id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Erreur lors de la suppression');
        return;
      }
      setKeyToDelete(null);
      fetchApiKeys();
    } catch {
      setError('Erreur réseau');
    } finally {
      setDeletingKey(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <p className="text-zinc-600 dark:text-zinc-400">
          L\'accès aux intégrations est réservé aux administrateurs de l\'organisation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-foreground">Intégrations</h1>
          {userOrgs.length > 1 && activeOrg && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {activeOrg.name}
            </span>
          )}
        </div>
        <p className="text-muted-foreground">
          Connectez les APIs externes pour synchroniser vos données. Les clés sont stockées de manière sécurisée.
        </p>
      </div>

      {/* Clé API - en premier */}
      <EditableCard
        variant="outline"
        isEditing={apiKeysExpanded}
        onEdit={() => setApiKeysExpanded(true)}
        onCloseEdit={() => setApiKeysExpanded(false)}
        headerContent={
          <div className="flex items-start justify-between gap-3 w-full">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 self-start">
                <Key size={20} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm">Clé API Boomkoeur</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Connectez votre site front externe pour récupérer les produits via l&apos;API.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {apiKeys.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApiKeysExpanded(true)}
                >
                  Gérer les clés
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateKey}
                disabled={generatingKey}
              >
                {generatingKey ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                    Génération...
                  </>
                ) : (
                  'Générer une clé'
                )}
              </Button>
            </div>
          </div>
        }
        editContent={
          <div className="space-y-4">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Clés existantes</p>
            <ul className="space-y-2">
              {apiKeys.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">{k.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-zinc-500">
                      {new Date(k.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    <IconButton
                      icon={<Trash2 size={14} />}
                      ariaLabel="Supprimer la clé"
                      variant="ghost"
                      size="xs"
                      className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => {
                        setError(null);
                        setKeyToDelete({ id: k.id, name: k.name });
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-zinc-500">
              Utilisez <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">Authorization: Bearer &lt;clé&gt;</code> ou <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">X-API-Key: &lt;clé&gt;</code> pour appeler <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">GET /api/products</code>.
            </p>
          </div>
        }
      />

      {/* Google Workspace */}
      <EditableCard
        variant="outline"
        isEditing={googleConfigExpanded || googleCalendarExpanded}
        onEdit={() => {}}
        onCloseEdit={() => {
          setGoogleConfigExpanded(false);
          setGoogleCalendarExpanded(false);
        }}
        headerContent={
          <div className="flex items-start justify-between gap-3 w-full">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 self-start">
                <Cloud size={20} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground text-sm">Google Workspace</h3>
                  {googleLoading ? (
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" />
                      Chargement...
                    </span>
                  ) : googleConnected ? (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 shrink-0">
                      <Check size={12} />
                      Connecté
                      {googleEmail && (
                        <span className="text-zinc-500 dark:text-zinc-400 font-normal">({googleEmail})</span>
                      )}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                  Drive (documents, médias), Gmail (emails) et Calendar pour vos événements et campagnes.
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2 shrink-0">
              {googleConnected ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setGoogleConfigExpanded(false);
                      setGoogleCalendarExpanded(true);
                      fetchCalendars();
                    }}
                    className="text-zinc-500 hover:text-foreground"
                  >
                    <Settings size={14} className="mr-1.5" />
                    Paramètres
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectGoogle}
                    disabled={googleDisconnecting}
                    className="text-zinc-500 hover:text-red-600"
                  >
                    {googleDisconnecting ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                        Déconnexion...
                      </>
                    ) : (
                      <>
                        <LogOut size={14} className="mr-1.5" />
                        Déconnecter
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGoogleCalendarExpanded(false);
                      setGoogleConfigExpanded(true);
                      fetchGoogleConfig();
                    }}
                    className="text-zinc-500 hover:text-foreground"
                  >
                    <Settings size={14} className="mr-1.5" />
                    Paramètres
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConnectGoogle}
                    disabled={googleLoading}
                  >
                    Connecter avec Google
                  </Button>
                </>
              )}
            </div>
          </div>
        }
        editContent={
          googleConfigExpanded ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveGoogleConfig();
              }}
              className="space-y-4"
              autoComplete="off"
            >
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Configurez les identifiants OAuth de votre projet Google Cloud pour connecter Google Workspace.
                L&apos;URI de redirection doit être ajoutée dans la console Google.
              </p>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div>
                <Label htmlFor="google-client-id" className="block mb-2">
                  Client ID
                </Label>
                <TokenInput
                  id="google-client-id"
                  name="google_client_id"
                  masked={false}
                  value={googleConfig.clientId}
                  onChange={(e) => setGoogleConfig((c) => ({ ...c, clientId: e.target.value }))}
                  placeholder="xxx.apps.googleusercontent.com"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="google-client-secret" className="block mb-2">
                  Client Secret
                </Label>
                <TokenInput
                  id="google-client-secret"
                  name="google_client_secret"
                  value={googleConfig.clientSecret}
                  onChange={(e) => setGoogleConfig((c) => ({ ...c, clientSecret: e.target.value }))}
                  placeholder="Laissez vide pour conserver l&apos;existant"
                  className="w-full font-mono"
                />
              </div>
              <div>
                <Label htmlFor="google-redirect-uri" className="block mb-2">
                  URI de redirection
                </Label>
                <TokenInput
                  id="google-redirect-uri"
                  name="google_redirect_uri"
                  masked={false}
                  value={googleConfig.redirectUri}
                  onChange={(e) => setGoogleConfig((c) => ({ ...c, redirectUri: e.target.value }))}
                  placeholder="https://votredomaine.com/api/admin/integrations/google/callback"
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setGoogleConfigExpanded(false)}
                  disabled={savingGoogleConfig}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={savingGoogleConfig}>
                  {savingGoogleConfig ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
                Calendriers à afficher dans le dashboard
              </Label>
            {loadingCalendars ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500 py-4">
                <Loader2 size={16} className="animate-spin" />
                Chargement des calendriers...
              </div>
            ) : availableCalendars.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableCalendars.map((cal) => (
                  <label
                    key={cal.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg border border-border-custom hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={googleCalendarIds.includes(cal.id)}
                      onChange={() => handleToggleCalendar(cal.id)}
                      className="rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 focus:ring-zinc-900"
                    />
                    <span className="text-sm font-medium truncate">{cal.summary}</span>
                    {cal.primary && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0">
                        Principal
                      </span>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Aucun calendrier trouvé.</p>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveGoogleCalendarId}
              disabled={savingCalendarId || loadingCalendars}
            >
              {savingCalendarId ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
          )
        }
      />

      {/* Shotgun et Meta - EditableCard integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {INTEGRATIONS.map((item) => (
          <EditableCard
            key={item.id}
            variant="outline"
            isEditing={selectedIntegration === item.id}
            onEdit={() => handleConnect(item.id)}
            onCloseEdit={handleCloseIntegration}
            headerContent={
              <div className="flex items-start justify-between gap-3 w-full">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 self-start">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                      {loadingStatus[item.id] ? (
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin" />
                          Chargement...
                        </span>
                      ) : connectedStatus[item.id] ? (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 shrink-0">
                          <Check size={12} />
                          Connecté
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant={connectedStatus[item.id] ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => handleConnect(item.id)}
                  className="shrink-0"
                >
                  {item.id === 'meta'
                    ? connectedStatus[item.id]
                      ? 'Déconnecter'
                      : 'Connecter avec Instagram'
                    : connectedStatus[item.id]
                      ? 'Modifier'
                      : 'Connecter'}
                </Button>
              </div>
            }
            editContent={
              <form id={`integration-form-${item.id}`} onSubmit={handleSave} className="space-y-4" autoComplete="off">
                <div className="absolute -left-[9999px] opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden>
                  <input type="text" name="fake_username" tabIndex={-1} autoComplete="username" />
                  <input type="password" name="fake_password" tabIndex={-1} autoComplete="current-password" />
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
                {item.id === 'shotgun' && (
                  <>
                    <div>
                      <Label htmlFor={`organizerId-${item.id}`} className="block mb-2">
                        Organizer ID
                      </Label>
                      <TokenInput
                        id={`organizerId-${item.id}`}
                        name="shotgun_organizer_id"
                        masked={false}
                        value={formData.organizerId}
                        onChange={(e) => setFormData({ ...formData, organizerId: e.target.value })}
                        placeholder="Identifiant de votre compte Shotgun"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`apiToken-${item.id}`} className="block mb-2">
                        Token API Shotgun
                      </Label>
                      <TokenInput
                        id={`apiToken-${item.id}`}
                        name="shotgun_api_token"
                        value={formData.apiToken}
                        onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                        placeholder="JWT depuis Settings > Integrations > Shotgun APIs"
                        className="w-full font-mono"
                      />
                    </div>
                  </>
                )}
                {item.id === 'meta' && (
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Compte Instagram connecté. Cliquez sur Déconnecter pour révoquer l&apos;accès.
                    </p>
                    <p className="text-xs text-zinc-500">
                      Les identifiants Instagram (App ID / Secret) sont configurés via les variables
                      d&apos;environnement INSTA_CLIENT_ID et INSTA_CLIENT_SECRET.
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={handleCloseIntegration} disabled={saving || metaDisconnecting}>
                    Annuler
                  </Button>
                  {selectedIntegration === 'meta' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleMetaDisconnect}
                      disabled={metaDisconnecting}
                    >
                      {metaDisconnecting ? (
                        <>
                          <Loader2 size={14} className="animate-spin mr-1.5" />
                          Déconnexion...
                        </>
                      ) : (
                        'Déconnecter'
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} className="animate-spin mr-1.5" />
                          Enregistrement...
                        </>
                      ) : (
                        'Enregistrer'
                      )}
                    </Button>
                  )}
                </div>
              </form>
            }
          />
        ))}
      </div>

      <Modal
        isOpen={!!newKeyModal}
        onClose={() => setNewKeyModal(null)}
        title="Clé API générée"
        size="md"
      >
        <ModalContent>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            Copiez cette clé maintenant. Elle ne sera plus affichée.
          </p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={newKeyModal?.key ?? ''}
              className="font-mono text-sm"
            />
            <Button variant="outline" size="sm" onClick={handleCopyKey}>
              <Copy size={16} />
            </Button>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="primary" size="sm" onClick={() => setNewKeyModal(null)}>
            J&apos;ai copié la clé
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={!!keyToDelete}
        onClose={() => {
          if (!deletingKey) {
            setKeyToDelete(null);
            setError(null);
          }
        }}
        title="Supprimer la clé API"
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-zinc-600 dark:text-zinc-400">
            Êtes-vous sûr de vouloir supprimer la clé &quot;{keyToDelete?.name}&quot; ? Les appels utilisant cette clé ne fonctionneront plus.
          </p>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
        <ModalFooter>
          <Button variant="outline" size="sm" onClick={() => setKeyToDelete(null)} disabled={deletingKey}>
            Annuler
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirmDeleteKey} disabled={deletingKey}>
            {deletingKey ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                Suppression...
              </>
            ) : (
              'Supprimer'
            )}
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  );
}
