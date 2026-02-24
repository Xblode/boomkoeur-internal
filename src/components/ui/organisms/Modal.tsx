'use client'

import { HTMLAttributes, ReactNode, useEffect, Children, isValidElement, type ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeIn } from '@/lib/animations'
import { Button } from '@/components/ui/atoms'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
  /** Contenu scrollable avec footer fixe en bas */
  scrollable?: boolean
  /** Variant de layout : default (padding) ou fullBleed (contenu sans padding, pour ModalThreeColumnLayout) */
  variant?: 'default' | 'fullBleed'
  /** @deprecated Utiliser variant="fullBleed" à la place */
  contentFullBleed?: boolean
}

const MODAL_HEADER_PADDING = 'p-4 sm:p-6'
const MODAL_CONTENT_PADDING = 'p-4 sm:p-6'
const MODAL_FOOTER_PADDING = 'p-4 sm:p-6'

// Animation spécifique pour le modal
const modalAnimation: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: { 
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

/**
 * Modal - Composant de dialogue modal
 * 
 * Affiche une fenêtre modale avec overlay, animations et gestion du clavier (Escape).
 * Bloque le scroll du body quand ouvert.
 * 
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={onClose} title="Mon titre" size="lg">
 *   <p>Contenu du modal</p>
 *   <ModalFooter>
 *     <Button onClick={onClose}>Fermer</Button>
 *   </ModalFooter>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  scrollable = false,
  variant = 'default',
  contentFullBleed = false,
}: ModalProps) {
  const isFullBleed = variant === 'fullBleed' || contentFullBleed
  // Fermer avec Escape et bloquer le scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-[90vw]',
  }
  
  // Parser les children : ModalHeader, ModalContent, ModalFooter
  const childrenArray = Children.toArray(children)
  const isModalPart = (child: React.ReactNode, Part: { displayName?: string; name?: string }) => {
    if (!isValidElement(child)) return false
    const childType = child.type as any
    return childType === Part || childType?.displayName === Part.displayName || (typeof childType === 'function' && childType.name === Part.name)
  }

  const headerIndex = childrenArray.findIndex((c) => isModalPart(c, ModalHeader))
  const contentIndex = childrenArray.findIndex((c) => isModalPart(c, ModalContent))
  const footerIndex = childrenArray.findIndex((c) => isModalPart(c, ModalFooter))

  const hasExplicitHeader = headerIndex !== -1
  const hasExplicitContent = contentIndex !== -1
  const hasExplicitFooter = footerIndex !== -1

  const headerElement = hasExplicitHeader ? childrenArray[headerIndex] : null
  const contentElement = hasExplicitContent ? childrenArray[contentIndex] : null
  const footerElement = hasExplicitFooter ? childrenArray[footerIndex] : null

  const extractFooter = scrollable || isFullBleed || hasExplicitFooter
  const contentChildren = childrenArray.filter((_, i) => i !== headerIndex && i !== contentIndex && i !== footerIndex)

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-[2000] m-0 p-0 overflow-hidden">
          {/* Overlay - couvre tout le viewport */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Modal - centré au milieu de l'écran */}
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              variants={modalAnimation}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                'border border-border-custom rounded-lg max-h-[95vh] pointer-events-auto flex flex-col shadow-lg bg-card-bg',
                sizes[size],
                'w-full overflow-hidden',
                !isFullBleed && !scrollable && 'overflow-auto'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {hasExplicitHeader ? (
                headerElement
              ) : (title || showCloseButton) && (
                <div className={cn(
                  'flex items-center justify-between border-b border-border-custom flex-shrink-0',
                  MODAL_HEADER_PADDING
                )}>
                  {title && (
                    <h2 className="text-2xl font-bold text-foreground">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      aria-label="Fermer"
                      className="ml-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
              
              {/* Content */}
              {hasExplicitContent ? (
                contentElement
              ) : (
                <div className={cn(
                  'flex flex-col min-h-0 flex-1',
                  isFullBleed && 'overflow-hidden border-t border-border-custom',
                  scrollable && !isFullBleed && 'overflow-y-auto min-h-0',
                  !isFullBleed && MODAL_CONTENT_PADDING
                )}>
                  {extractFooter ? contentChildren : children}
                </div>
              )}
              
              {/* Footer */}
              {extractFooter && footerElement && (
                <ModalFooter scrollable={!!scrollable || !!isFullBleed}>
                  {isValidElement(footerElement) ? (footerElement as ReactElement<{ children?: ReactNode }>).props.children : null}
                </ModalFooter>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}

/**
 * ModalHeader - En-tête du modal avec padding propre
 */
export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function ModalHeader({ className, children, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-b border-border-custom flex-shrink-0',
        MODAL_HEADER_PADDING,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
ModalHeader.displayName = 'ModalHeader'

/**
 * ModalContent - Contenu du modal avec padding propre
 */
export interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Désactive le padding (ex: pour variant="fullBleed") */
  noPadding?: boolean
}

export function ModalContent({ className, children, noPadding, ...props }: ModalContentProps) {
  return (
    <div
      className={cn(
        'flex flex-col min-h-0 flex-1 overflow-y-auto',
        !noPadding && MODAL_CONTENT_PADDING,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
ModalContent.displayName = 'ModalContent'

/**
 * ModalFooter - Footer du modal pour les actions
 * 
 * Affiche une barre en bas du modal avec les boutons d'action.
 * Peut être fixe (en mode scrollable) ou relative (en mode normal).
 */
export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  scrollable?: boolean
}

export function ModalFooter({ className, children, scrollable = false, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'border-t border-border-custom flex items-center justify-end gap-4 flex-shrink-0',
        MODAL_FOOTER_PADDING,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
ModalFooter.displayName = 'ModalFooter'

/**
 * ModalThreeColumnLayout - Layout 3 colonnes pour modals type Artistes/Bénévoles
 *
 * Structure : sidebar (250px) | liste (1fr) | détail (1fr)
 * À utiliser avec Modal variant="fullBleed".
 *
 * @example
 * ```tsx
 * <Modal isOpen={open} onClose={onClose} title="Artistes" size="lg" variant="fullBleed">
 *   <ModalThreeColumnLayout
 *     sidebar={<aside>...</aside>}
 *     list={<div>...</div>}
 *     detail={<div>...</div>}
 *   />
 *   <ModalFooter>...</ModalFooter>
 * </Modal>
 * ```
 */
export interface ModalThreeColumnLayoutProps {
  sidebar: ReactNode
  list: ReactNode
  detail: ReactNode
  gridTemplateColumns?: string
  minHeight?: string
}

export function ModalThreeColumnLayout({
  sidebar,
  list,
  detail,
  gridTemplateColumns = '250px 1fr 1fr',
  minHeight = '400px',
}: ModalThreeColumnLayoutProps) {
  return (
    <div
      className="grid overflow-hidden h-full min-w-0"
      style={{ gridTemplateColumns, minHeight }}
    >
      <aside className="border-r border-border-custom flex flex-col bg-zinc-50/30 dark:bg-zinc-900/20 min-w-0">
        {sidebar}
      </aside>
      <div className="border-r border-border-custom flex flex-col overflow-hidden min-w-0">
        {list}
      </div>
      <div className="overflow-y-auto p-5 min-w-0">
        {detail}
      </div>
    </div>
  )
}

/**
 * ModalTwoColumnLayout - Layout 2 colonnes avec scroll indépendant
 *
 * Chaque colonne scroll indépendamment. À utiliser avec Modal variant="fullBleed".
 */
export interface ModalTwoColumnLayoutProps {
  left: ReactNode
  right: ReactNode
  leftWidth?: string
  minHeight?: string
}

export function ModalTwoColumnLayout({
  left,
  right,
  leftWidth = '16rem',
  minHeight = '320px',
}: ModalTwoColumnLayoutProps) {
  return (
    <div
      className="flex gap-4 overflow-hidden min-w-0 flex-1"
      style={{ minHeight }}
    >
      <aside
        className="shrink-0 border-r border-zinc-200 dark:border-zinc-700 overflow-y-auto flex flex-col"
        style={{ width: leftWidth }}
      >
        {left}
      </aside>
      <div className="flex-1 min-w-0 min-h-0 overflow-y-auto flex flex-col">
        {right}
      </div>
    </div>
  )
}
ModalTwoColumnLayout.displayName = 'ModalTwoColumnLayout'
