'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, ModalFooter, ModalTwoColumnLayout } from '@/components/ui/organisms/Modal';
import { Button, Input } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import { FolderOpen, Folder, Image as ImageIcon, Film, FileText, ChevronRight, ChevronDown, Loader2, Link2, Monitor } from 'lucide-react';

/** ID spécial pour le dossier "Ordinateur" (Google Drive for Desktop) */
const COMPUTERS_FOLDER_ID = 'computers';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  isFolder: boolean;
}

interface DrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** url et optionnellement name (pour mode document) */
  onSelect: (url: string, name?: string) => void;
  orgId: string;
  /** 'image' = images/vidéos, 'document' = Docs, Sheets, Slides, PDF */
  mode?: 'image' | 'document';
}

type FolderContents = { folders: DriveFile[]; files: DriveFile[] };

export function DrivePickerModal({ isOpen, onClose, onSelect, orgId, mode = 'image' }: DrivePickerModalProps) {
  const [folderContents, setFolderContents] = useState<Map<string | null, FolderContents>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
  const [nextPageTokens, setNextPageTokens] = useState<Map<string | null, string | null>>(new Map());
  const [loadingMore, setLoadingMore] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const loadFolder = useCallback(
    async (folderId: string | null, pageToken?: string | null, append = false) => {
      if (!orgId) return;
      const isLoadMore = !!pageToken && append;
      if (isLoadMore) setLoadingMore(true);
      else {
        setLoading(true);
        if (folderId) setLoadingFolders((prev) => new Set(prev).add(folderId));
      }
      setError(null);

      try {
        const params = new URLSearchParams({ org_id: orgId });
        if (folderId) params.set('folder_id', folderId);
        if (pageToken) params.set('page_token', pageToken);

        const res = await fetch(`/api/admin/integrations/google/drive/files?${params}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? 'Erreur lors du chargement');
        }

        const newFiles = data.files ?? [];
        const folders = newFiles.filter((f: DriveFile) => f.isFolder).sort((a: DriveFile, b: DriveFile) =>
          (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })
        );
        const files = newFiles.filter((f: DriveFile) => !f.isFolder).sort((a: DriveFile, b: DriveFile) =>
          (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })
        );

        setFolderContents((prev) => {
          const next = new Map(prev);
          const existing = next.get(folderId) ?? { folders: [], files: [] };
          const updated: FolderContents = append
            ? { folders: [...existing.folders, ...folders], files: [...existing.files, ...files] }
            : { folders, files };
          next.set(folderId, updated);
          return next;
        });
        setNextPageTokens((prev) => {
          const next = new Map(prev);
          next.set(folderId, data.nextPageToken ?? null);
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        if (!append) setFolderContents((prev) => new Map(prev).set(folderId, { folders: [], files: [] }));
      } finally {
        setLoading(false);
        setLoadingMore(false);
        if (folderId) setLoadingFolders((prev) => { const n = new Set(prev); n.delete(folderId); return n; });
      }
    },
    [orgId]
  );

  useEffect(() => {
    if (isOpen) {
      setFolderContents(new Map());
      setExpandedFolders(new Set());
      setSelectedFolderId(null);
      setNextPageTokens(new Map());
      setError(null);
      setShowUrlFallback(false);
      setUrlInput('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && orgId) {
      loadFolder(null);
    }
  }, [isOpen, orgId, loadFolder]);

  const handleFolderClick = (folder: DriveFile) => {
    const alreadyLoaded = folderContents.has(folder.id);
    const isExpanded = expandedFolders.has(folder.id);

    setSelectedFolderId(folder.id);

    if (!alreadyLoaded) {
      setExpandedFolders((prev) => new Set(prev).add(folder.id));
      loadFolder(folder.id);
    } else {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (isExpanded) next.delete(folder.id);
        else next.add(folder.id);
        return next;
      });
    }
  };

  const handleRootClick = () => {
    setSelectedFolderId(null);
  };

  const handleComputersClick = () => {
    const alreadyLoaded = folderContents.has(COMPUTERS_FOLDER_ID);
    const isExpanded = expandedFolders.has(COMPUTERS_FOLDER_ID);

    setSelectedFolderId(COMPUTERS_FOLDER_ID);

    if (!alreadyLoaded) {
      setExpandedFolders((prev) => new Set(prev).add(COMPUTERS_FOLDER_ID));
      loadFolder(COMPUTERS_FOLDER_ID);
    } else {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (isExpanded) next.delete(COMPUTERS_FOLDER_ID);
        else next.add(COMPUTERS_FOLDER_ID);
        return next;
      });
    }
  };

  const handleFileSelect = (file: DriveFile) => {
    onSelect(file.webViewLink, mode === 'document' ? file.name : undefined);
    onClose();
  };

  const handleLoadMore = (folderId: string | null) => {
    const token = nextPageTokens.get(folderId);
    if (token && !loadingMore) loadFolder(folderId, token, true);
  };

  const getFileTypeLabel = (f: DriveFile) => {
    if (f.mimeType.startsWith('video/')) return 'Vidéo';
    if (f.mimeType.startsWith('image/')) return 'Image';
    if (f.mimeType.includes('document')) return 'Document';
    if (f.mimeType.includes('spreadsheet')) return 'Tableur';
    if (f.mimeType.includes('presentation')) return 'Présentation';
    if (f.mimeType === 'application/pdf') return 'PDF';
    return 'Fichier';
  };

  const rootContents = folderContents.get(null);
  const selectedContents = selectedFolderId ? folderContents.get(selectedFolderId) : rootContents;
  const allFiles = selectedContents?.files ?? [];
  const isSelectableFile = (f: DriveFile) => {
    if (mode === 'document') {
      return (
        f.mimeType === 'application/vnd.google-apps.document' ||
        f.mimeType === 'application/vnd.google-apps.spreadsheet' ||
        f.mimeType === 'application/vnd.google-apps.presentation' ||
        f.mimeType === 'application/pdf'
      );
    }
    return f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/');
  };
  const displayNextToken = selectedFolderId ? nextPageTokens.get(selectedFolderId) : nextPageTokens.get(null);

  const renderFolderTree = (parentId: string | null, level = 0) => {
    if (parentId === null) {
      // Niveau racine : Ordinateur au-dessus de Mon Drive
      const computersContents = folderContents.get(COMPUTERS_FOLDER_ID);
      const computersFolders = computersContents?.folders ?? [];
      const rootContents = folderContents.get(null);
      const rootFolders = rootContents?.folders ?? [];
      const isComputersExpanded = expandedFolders.has(COMPUTERS_FOLDER_ID);
      const isComputersLoaded = folderContents.has(COMPUTERS_FOLDER_ID);
      const isLoadingComputers = loadingFolders.has(COMPUTERS_FOLDER_ID);

      return (
        <div className="flex flex-col gap-0.5">
          {/* Ordinateur - au-dessus de Mon Drive */}
          <button
            type="button"
            onClick={handleComputersClick}
            className={cn(
              'flex items-center gap-2 py-1.5 px-2 rounded text-left text-sm w-full',
              selectedFolderId === COMPUTERS_FOLDER_ID
                ? 'bg-zinc-100 dark:bg-zinc-800 font-medium'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            )}
          >
            {isComputersLoaded && computersFolders.length > 0 ? (
              isComputersExpanded ? (
                <ChevronDown size={16} className="text-zinc-400 shrink-0" />
              ) : (
                <ChevronRight size={16} className="text-zinc-400 shrink-0" />
              )
            ) : isLoadingComputers ? (
              <Loader2 size={16} className="animate-spin text-zinc-400 shrink-0" />
            ) : (
              <ChevronRight size={16} className="text-zinc-400 shrink-0 opacity-50" />
            )}
            <Monitor size={18} className="text-amber-500 shrink-0" />
            <span className="truncate">Ordinateur</span>
          </button>
          {isComputersExpanded && isComputersLoaded && computersFolders.length > 0 && (
            <div className="ml-3 border-l border-zinc-200 dark:border-zinc-700 pl-2">
              {computersFolders.map((f) => {
                const isExpanded = expandedFolders.has(f.id);
                const hasLoaded = folderContents.has(f.id);
                const isLoading = loadingFolders.has(f.id);
                const subfolders = folderContents.get(f.id)?.folders ?? [];

                return (
                  <div key={f.id} className="mt-0.5">
                    <button
                      type="button"
                      onClick={() => handleFolderClick(f)}
                      className={cn(
                        'flex items-center gap-2 py-1.5 px-2 rounded text-left text-sm w-full',
                        selectedFolderId === f.id
                          ? 'bg-zinc-100 dark:bg-zinc-800 font-medium'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      )}
                    >
                      {hasLoaded && subfolders.length > 0 ? (
                        isExpanded ? (
                          <ChevronDown size={16} className="text-zinc-400 shrink-0" />
                        ) : (
                          <ChevronRight size={16} className="text-zinc-400 shrink-0" />
                        )
                      ) : isLoading ? (
                        <Loader2 size={16} className="animate-spin text-zinc-400 shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-zinc-400 shrink-0 opacity-0" />
                      )}
                      <FolderOpen size={18} className="text-amber-500 shrink-0" />
                      <span className="truncate flex-1">{f.name}</span>
                    </button>
                    {isExpanded && hasLoaded && subfolders.length > 0 && (
                      <div className="mt-0.5">{renderFolderTree(f.id, level + 2)}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Mon Drive */}
          <button
            type="button"
            onClick={handleRootClick}
            className={cn(
              'flex items-center gap-2 py-1.5 px-2 rounded text-left text-sm w-full',
              selectedFolderId === null
                ? 'bg-zinc-100 dark:bg-zinc-800 font-medium'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            )}
          >
            <Folder size={18} className="text-amber-500 shrink-0" />
            <span className="truncate">Mon Drive</span>
          </button>
          {rootFolders.map((f) => {
            const isExpanded = expandedFolders.has(f.id);
            const hasLoaded = folderContents.has(f.id);
            const isLoading = loadingFolders.has(f.id);
            const subfolders = folderContents.get(f.id)?.folders ?? [];

            return (
              <div key={f.id} className="mt-0.5">
                <button
                  type="button"
                  onClick={() => handleFolderClick(f)}
                  className={cn(
                    'flex items-center gap-2 py-1.5 px-2 rounded text-left text-sm w-full',
                    selectedFolderId === f.id
                      ? 'bg-zinc-100 dark:bg-zinc-800 font-medium'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  )}
                >
                  {hasLoaded && subfolders.length > 0 ? (
                    isExpanded ? (
                      <ChevronDown size={16} className="text-zinc-400 shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="text-zinc-400 shrink-0" />
                    )
                  ) : isLoading ? (
                    <Loader2 size={16} className="animate-spin text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-zinc-400 shrink-0 opacity-0" />
                  )}
                  <FolderOpen size={18} className="text-amber-500 shrink-0" />
                  <span className="truncate flex-1">{f.name}</span>
                </button>
                {isExpanded && hasLoaded && subfolders.length > 0 && (
                  <div className="mt-0.5 ml-3 border-l border-zinc-200 dark:border-zinc-700 pl-2">
                    {renderFolderTree(f.id, level + 1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Sous-dossiers (récursion)
    const contents = folderContents.get(parentId);
    const folders = contents?.folders ?? [];
    if (!contents || folders.length === 0) return null;

    return (
      <div className={cn('flex flex-col', level > 0 && 'ml-3 border-l border-zinc-200 dark:border-zinc-700 pl-2')}>
        {folders.map((f) => {
          const isExpanded = expandedFolders.has(f.id);
          const hasLoaded = folderContents.has(f.id);
          const isLoading = loadingFolders.has(f.id);
          const subfolders = folderContents.get(f.id)?.folders ?? [];

          return (
            <div key={f.id} className="mt-0.5">
              <button
                type="button"
                onClick={() => handleFolderClick(f)}
                className={cn(
                  'flex items-center gap-2 py-1.5 px-2 rounded text-left text-sm w-full',
                  selectedFolderId === f.id
                    ? 'bg-zinc-100 dark:bg-zinc-800 font-medium'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                )}
              >
                {hasLoaded && subfolders.length > 0 ? (
                  isExpanded ? (
                    <ChevronDown size={16} className="text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-zinc-400 shrink-0" />
                  )
                ) : isLoading ? (
                  <Loader2 size={16} className="animate-spin text-zinc-400 shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-zinc-400 shrink-0 opacity-0" />
                )}
                <FolderOpen size={18} className="text-amber-500 shrink-0" />
                <span className="truncate flex-1">{f.name}</span>
              </button>
              {isExpanded && hasLoaded && subfolders.length > 0 && (
                <div className="mt-0.5">
                  {renderFolderTree(f.id, level + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'document' ? 'Sélectionner un document depuis Google Drive' : 'Sélectionner une image depuis Google Drive'}
      size="lg"
      variant="fullBleed"
    >
      <ModalTwoColumnLayout
        leftWidth="16rem"
        minHeight="360px"
        left={
          <div className="pr-4 py-2">
            {loading && !rootContents ? (
              <div className="flex items-center gap-2 py-4 text-sm text-zinc-500">
                <Loader2 size={18} className="animate-spin" />
                Chargement...
              </div>
            ) : error && !rootContents ? (
              <div className="py-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={() => loadFolder(null)}>
                  Réessayer
                </Button>
              </div>
            ) : (
              renderFolderTree(null)
            )}
          </div>
        }
        right={
          <div className="flex flex-col h-full p-4">
          {loading && !selectedContents ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 size={32} className="animate-spin text-zinc-400" />
              <p className="text-sm text-zinc-500">Chargement...</p>
            </div>
          ) : error && selectedFolderId && !selectedContents ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
              <Button variant="outline" size="sm" onClick={() => loadFolder(selectedFolderId)}>
                Réessayer
              </Button>
            </div>
          ) : allFiles.length > 0 ? (
            <>
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-auto flex-1 min-h-0">
                <table className="w-full text-sm table-fixed">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
                      <th className="text-left px-3 py-2 font-medium text-zinc-600 dark:text-zinc-400 w-8" />
                      <th className="text-left px-3 py-2 font-medium text-zinc-600 dark:text-zinc-400 w-40">
                        Nom
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-zinc-600 dark:text-zinc-400 w-24">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFiles.map((f) => {
                      const selectable = isSelectableFile(f);
                      return (
                        <tr
                          key={f.id}
                          role={selectable ? 'button' : undefined}
                          tabIndex={selectable ? 0 : undefined}
                          onClick={selectable ? () => handleFileSelect(f) : undefined}
                          onKeyDown={
                            selectable
                              ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleFileSelect(f);
                                  }
                                }
                              : undefined
                          }
                          className={cn(
                            'border-b border-zinc-100 dark:border-zinc-800 last:border-0',
                            selectable
                              ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors'
                              : 'opacity-60 cursor-default'
                          )}
                        >
                          <td className="px-3 py-2">
                            {f.mimeType.startsWith('video/') ? (
                              <Film size={18} className="text-zinc-400" />
                            ) : f.mimeType.startsWith('image/') ? (
                              <ImageIcon size={18} className="text-zinc-400" />
                            ) : (
                              <FileText size={18} className="text-zinc-400" />
                            )}
                          </td>
                          <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {f.name}
                          </td>
                          <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 text-xs">
                            {getFileTypeLabel(f)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {displayNextToken && (
                <div className="flex justify-center pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadMore(selectedFolderId)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? <Loader2 size={16} className="animate-spin" /> : 'Charger plus'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center flex-1">
              <ImageIcon size={40} className="text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {selectedContents
                  ? (mode === 'document' ? 'Aucun document (Docs, Sheets, Slides, PDF) dans ce dossier' : 'Aucune image ou vidéo dans ce dossier')
                  : 'Sélectionnez un dossier à gauche'}
              </p>
              {!rootContents && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open('/dashboard/admin/integration', '_blank');
                    onClose();
                  }}
                >
                  Reconnecter Google (Administration)
                </Button>
              )}
            </div>
          )}
        </div>
      }
    />

      <ModalFooter>
        <div className="flex flex-col gap-3 w-full">
          {showUrlFallback && (
            <div className="flex gap-2">
              <Input
                type="url"
                size="sm"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (urlInput.trim()) {
                    onSelect(urlInput.trim());
                    onClose();
                  }
                }}
                disabled={!urlInput.trim()}
              >
                Valider
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setShowUrlFallback(!showUrlFallback)}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1.5"
            >
              <Link2 size={14} />
              {showUrlFallback ? 'Masquer le champ URL' : 'Ou saisir une URL'}
            </button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}
