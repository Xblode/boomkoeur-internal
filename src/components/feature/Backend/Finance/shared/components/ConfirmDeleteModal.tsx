'use client'

import { Modal, ModalFooter } from '@/components/ui/organisms'
import { Button } from '@/components/ui/atoms'

export interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmLabel?: string
  isLoading?: boolean
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Supprimer',
  isLoading = false,
}: ConfirmDeleteModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onClose()
    } catch {
      // Erreur gérée par le parent (alert, toast, etc.) — on ne ferme pas
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-muted-foreground">{description}</p>
      <ModalFooter>
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          Annuler
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Suppression...' : confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
