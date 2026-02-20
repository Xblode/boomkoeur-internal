'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/atoms'
import { Card } from '@/components/ui/molecules'
import { Badge } from '@/components/ui/atoms'
import { Upload, X, Download, File, Image, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AssetFile {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  url?: string
  usage?: string
}

export interface AssetUploaderPanelProps {
  /** Fichiers actuels */
  files?: AssetFile[]
  /** Callback appelé quand un fichier est ajouté */
  onFileAdd?: (file: File) => Promise<void> | void
  /** Callback appelé quand un fichier est supprimé */
  onFileRemove?: (fileId: string) => Promise<void> | void
  /** Callback appelé quand on télécharge un fichier */
  onFileDownload?: (file: AssetFile) => void
  /** Options d'usage des fichiers */
  usageOptions?: { value: string; label: string }[]
  /** Usage par défaut */
  defaultUsage?: string
  /** Autoriser plusieurs fichiers */
  allowMultiple?: boolean
  /** Titre du panel */
  title?: string
  /** Classe CSS personnalisée */
  className?: string
}

/**
 * AssetUploaderPanel - Panneau d'upload de fichiers
 * 
 * Composant permettant d'uploader, visualiser et gérer des fichiers.
 * Supporte le drag & drop et la prévisualisation.
 * 
 * @example
 * ```tsx
 * <AssetUploaderPanel
 *   files={files}
 *   onFileAdd={async (file) => {
 *     const uploaded = await uploadFile(file)
 *     setFiles([...files, uploaded])
 *   }}
 *   onFileRemove={async (id) => {
 *     await deleteFile(id)
 *     setFiles(files.filter(f => f.id !== id))
 *   }}
 *   allowMultiple={true}
 * />
 * ```
 */
export function AssetUploaderPanel({
  files = [],
  onFileAdd,
  onFileRemove,
  onFileDownload,
  usageOptions = [
    { value: 'attachment', label: 'Pièce jointe' },
    { value: 'thumbnail', label: 'Miniature' },
    { value: 'banner', label: 'Bannière' },
  ],
  defaultUsage = 'attachment',
  allowMultiple = true,
  title = 'Fichiers',
  className,
}: AssetUploaderPanelProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files
      if (!selectedFiles || selectedFiles.length === 0 || !onFileAdd) return

      const filesArray = Array.from(selectedFiles)
      if (!allowMultiple && filesArray.length > 1) {
        alert('Un seul fichier autorisé')
        return
      }

      setUploading(true)

      try {
        for (const file of filesArray) {
          await onFileAdd(file)
        }
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error)
      } finally {
        setUploading(false)
        // Réinitialiser l'input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [onFileAdd, allowMultiple]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragOver(false)

      if (!onFileAdd) return

      const droppedFiles = event.dataTransfer.files
      if (!droppedFiles || droppedFiles.length === 0) return

      const filesArray = Array.from(droppedFiles)
      if (!allowMultiple && filesArray.length > 1) {
        alert('Un seul fichier autorisé')
        return
      }

      setUploading(true)

      Promise.all(filesArray.map(file => onFileAdd(file)))
        .then(() => {
          setUploading(false)
        })
        .catch((error) => {
          console.error('Erreur lors de l\'upload:', error)
          setUploading(false)
        })
    },
    [onFileAdd, allowMultiple]
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleDelete = useCallback(
    async (fileId: string) => {
      if (!onFileRemove) return
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
        return
      }

      try {
        await onFileRemove(fileId)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    },
    [onFileRemove]
  )

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-4 h-4" />
    }
    if (mimeType === 'application/pdf') {
      return <FileText className="w-4 h-4" />
    }
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">
            {title}
          </h3>
        </div>

        {/* Upload zone */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            uploading && 'border-zinc-900 dark:border-zinc-50 bg-zinc-100 dark:bg-zinc-800',
            dragOver && 'border-zinc-900 dark:border-zinc-50 bg-zinc-100 dark:bg-zinc-800',
            !uploading && !dragOver && 'border-border-custom hover:border-zinc-900 dark:hover:border-zinc-50 cursor-pointer'
          )}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={allowMultiple}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-zinc-900 dark:border-zinc-50 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-zinc-500" />
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Cliquez pour uploader {allowMultiple ? 'des fichiers' : 'un fichier'}
              </p>
              <p className="text-xs text-zinc-500">
                Glissez-déposez {allowMultiple ? 'les fichiers' : 'le fichier'} ici
              </p>
            </div>
          )}
        </div>

        {/* Liste des fichiers */}
        {files.length === 0 ? (
          <div className="text-center py-4 text-zinc-500">
            <p className="text-sm">Aucun fichier</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-border-custom hover:border-zinc-900 dark:hover:border-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-zinc-500 flex-shrink-0">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.filename}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500">
                        {formatFileSize(file.sizeBytes)}
                      </span>
                      {file.usage && (
                        <Badge variant="default" className="text-xs">
                          {usageOptions.find((opt) => opt.value === file.usage)?.label ||
                            file.usage}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onFileDownload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFileDownload(file)}
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  {onFileRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                      title="Supprimer"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
