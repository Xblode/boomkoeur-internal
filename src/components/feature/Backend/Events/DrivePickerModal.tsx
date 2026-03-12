'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, ModalFooter } from '@/components/ui/organisms/Modal';
import { Button, Input } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import { Folder, Image as ImageIcon, Film, FileText, ChevronRight, Loader2, Link2, Monitor, LayoutGrid, List } from 'lucide-react';

/** ID spécial pour le dossier "Ordinateur" (Google Drive for Desktop) */
const COMPUTERS_FOLDER_ID = 'computers';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  isFolder: boolean;
}

interface DrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** url, name (optionnel), mimeType (optionnel, pour distinguer image/vidéo/fichier) */
  onSelect: (url: string, name?: string, mimeType?: string) => void;
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
  const [nextPageTokens, setNextPageTokens] = useState<Map<string | null, string | null>>(new Map());
  const [loadingMore, setLoadingMore] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  /** Chemin de navigation pour le breadcrumb : [{ id, name }, ...] */
  const [breadcrumbPath, setBreadcrumbPath] = useState<Array<{ id: string; name: string }>>([]);
  /** 'mydrive' | 'computers' pour le breadcrumb */
  const [rootType, setRootType] = useState<'mydrive' | 'computers'>('mydrive');
  /** Vue grille (images) ou liste (documents) */
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadFolder = useCallback(
    async (folderId: string | null, pageToken?: string | null, append = false, silent = false) => {
      if (!orgId) return;
      const isLoadMore = !!pageToken && append;
      if (!silent) {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
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

        // Préchargement : charger les sous-dossiers en arrière-plan (max 8 en parallèle)
        if (!append && !silent && folders.length > 0) {
          const toPreload = folders.slice(0, 8).map((f: DriveFile) => f.id);
          const preloadParams = new URLSearchParams({ org_id: orgId, folder_ids: toPreload.join(',') });
          fetch(`/api/admin/integrations/google/drive/files?${preloadParams}`)
            .then((r) => r.json())
            .then((batchData) => {
              if (batchData.results) {
                setFolderContents((prev) => {
                  const next = new Map(prev);
                  for (const [id, result] of Object.entries(batchData.results as Record<string, { files: DriveFile[]; nextPageToken: string | null }>)) {
                    const f = result.files ?? [];
                    const subFolders = f.filter((x: DriveFile) => x.isFolder).sort((a: DriveFile, b: DriveFile) =>
                      (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })
                    );
                    const subFiles = f.filter((x: DriveFile) => !x.isFolder).sort((a: DriveFile, b: DriveFile) =>
                      (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })
                    );
                    next.set(id, { folders: subFolders, files: subFiles });
                  }
                  return next;
                });
                setNextPageTokens((prev) => {
                  const next = new Map(prev);
                  for (const [id, result] of Object.entries(batchData.results as Record<string, { nextPageToken: string | null }>)) {
                    next.set(id, result.nextPageToken ?? null);
                  }
                  return next;
                });
              }
            })
            .catch(() => {});
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        if (!append) setFolderContents((prev) => new Map(prev).set(folderId, { folders: [], files: [] }));
      } finally {
        if (!silent) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [orgId]
  );

  useEffect(() => {
    if (isOpen) {
      setFolderContents(new Map());
      setSelectedFolderId(null);
      setNextPageTokens(new Map());
      setBreadcrumbPath([]);
      setRootType('mydrive');
      setViewMode(mode === 'image' ? 'grid' : 'list');
      setError(null);
      setShowUrlFallback(false);
      setUrlInput('');
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (isOpen && orgId) {
      loadFolder(null);
    }
  }, [isOpen, orgId, loadFolder]);

  const handleFolderClick = (folder: DriveFile, pathFromRoot: Array<{ id: string; name: string }>) => {
    const alreadyLoaded = folderContents.has(folder.id);

    setSelectedFolderId(folder.id);
    setBreadcrumbPath([...pathFromRoot, { id: folder.id, name: folder.name }]);

    if (!alreadyLoaded) {
      loadFolder(folder.id);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setSelectedFolderId(rootType === 'computers' ? COMPUTERS_FOLDER_ID : null);
      setBreadcrumbPath([]);
      return;
    }
    const item = breadcrumbPath[index];
    setSelectedFolderId(item.id);
    setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
  };

  const handleRootClick = () => {
    setSelectedFolderId(null);
    setBreadcrumbPath([]);
    setRootType('mydrive');
  };

  const handleComputersClick = () => {
    const alreadyLoaded = folderContents.has(COMPUTERS_FOLDER_ID);

    setSelectedFolderId(COMPUTERS_FOLDER_ID);
    setBreadcrumbPath([]);
    setRootType('computers');

    if (!alreadyLoaded) {
      loadFolder(COMPUTERS_FOLDER_ID);
    }
  };

  const handleFileSelect = (file: DriveFile) => {
    onSelect(file.webViewLink, mode === 'document' ? file.name : undefined, file.mimeType);
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
  const folders = selectedContents?.folders ?? [];
  const files = selectedContents?.files ?? [];
  /** Dossiers + fichiers pour affichage type Google Drive (dossiers en premier) */
  const allItems = [...folders, ...files];
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'document' ? 'Sélectionner un document depuis Google Drive' : 'Sélectionner une image depuis Google Drive'}
      size="lg"
      variant="fullBleed"
    >
      <div className="flex flex-col h-full min-h-[360px] p-4">
          {/* Breadcrumb + Mon Drive / Ordinateur switcher */}
          <nav className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 mb-3 flex-wrap min-h-[28px]">
            {breadcrumbPath.length === 0 ? (
              /* À la racine : switcher Mon Drive / Ordinateur */
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleRootClick}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors',
                    rootType === 'mydrive'
                      ? 'bg-zinc-200 dark:bg-zinc-700 font-medium text-zinc-900 dark:text-zinc-100'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  )}
                >
                  <Folder size={16} />
                  Mon Drive
                </button>
                <button
                  type="button"
                  onClick={handleComputersClick}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors',
                    rootType === 'computers'
                      ? 'bg-zinc-200 dark:bg-zinc-700 font-medium text-zinc-900 dark:text-zinc-100'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  )}
                >
                  <Monitor size={16} />
                  Ordinateur
                </button>
              </div>
            ) : (
              /* En chemin : breadcrumb classique */
              <>
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(-1)}
                  className="px-1.5 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {rootType === 'computers' ? 'Ordinateur' : 'Mon Drive'}
                </button>
              </>
            )}
            {breadcrumbPath.map((item, i) => (
              <span key={item.id} className="flex items-center gap-1">
                <ChevronRight size={14} className="text-zinc-400 shrink-0" />
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(i)}
                  className={cn(
                    'px-1.5 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate max-w-[120px]',
                    selectedFolderId === item.id && 'font-medium text-zinc-900 dark:text-zinc-100'
                  )}
                  title={item.name}
                >
                  {item.name}
                </button>
              </span>
            ))}
          </nav>
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
          ) : allItems.length > 0 ? (
            <>
              {mode === 'image' && (
                <div className="flex items-center gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-1.5 rounded transition-colors',
                      viewMode === 'grid' ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                    title="Vue grille"
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-1.5 rounded transition-colors',
                      viewMode === 'list' ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                    title="Vue liste"
                  >
                    <List size={18} />
                  </button>
                </div>
              )}
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-auto flex-1 min-h-0">
                {mode === 'image' && viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3">
                    {allItems.map((f) => {
                      const isFolder = f.isFolder;
                      const selectable = !isFolder && isSelectableFile(f);
                      const isVideo = f.mimeType.startsWith('video/');
                      const pathFromRoot = breadcrumbPath;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={
                            isFolder
                              ? () => handleFolderClick(f, pathFromRoot)
                              : selectable
                                ? () => handleFileSelect(f)
                                : undefined
                          }
                          disabled={!isFolder && !selectable}
                          className={cn(
                            'group flex flex-col items-stretch gap-2 text-left',
                            isFolder || selectable
                              ? 'cursor-pointer'
                              : 'cursor-default opacity-60'
                          )}
                        >
                          <div
                            className={cn(
                              'aspect-square w-full rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden transition-all',
                              isFolder || selectable
                                ? 'hover:border-zinc-400 dark:hover:border-zinc-500 hover:shadow-md'
                                : ''
                            )}
                          >
                            {isFolder ? (
                              <Folder size={40} className="text-amber-500" />
                            ) : (
                              <div className="text-zinc-400">
                                {isVideo ? <Film size={32} /> : <ImageIcon size={32} />}
                              </div>
                            )}
                          </div>
                          <span className="w-full truncate text-sm font-medium text-zinc-900 dark:text-zinc-100 text-left" title={f.name}>
                            {f.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
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
                    {allItems.map((f) => {
                      const isFolder = f.isFolder;
                      const selectable = !isFolder && isSelectableFile(f);
                      return (
                        <tr
                          key={f.id}
                          role={isFolder || selectable ? 'button' : undefined}
                          tabIndex={isFolder || selectable ? 0 : undefined}
                          onClick={
                            isFolder
                              ? () => handleFolderClick(f, breadcrumbPath)
                              : selectable
                                ? () => handleFileSelect(f)
                                : undefined
                          }
                          onKeyDown={
                            isFolder || selectable
                              ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    if (isFolder) handleFolderClick(f, breadcrumbPath);
                                    else handleFileSelect(f);
                                  }
                                }
                              : undefined
                          }
                          className={cn(
                            'border-b border-zinc-100 dark:border-zinc-800 last:border-0',
                            isFolder || selectable
                              ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors'
                              : 'opacity-60 cursor-default'
                          )}
                        >
                          <td className="px-3 py-2">
                            {f.isFolder ? (
                              <Folder size={18} className="text-amber-500" />
                            ) : f.mimeType.startsWith('video/') ? (
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
                            {f.isFolder ? 'Dossier' : getFileTypeLabel(f)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                )}
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
                  : 'Aucun contenu'}
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
