'use client'

import { HTMLAttributes, ReactNode, useEffect, Children, isValidElement, type ReactElement } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeIn, scaleIn } from '@/lib/animations'
import { Button } from '@/components/ui/atoms'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
  scrollable?: boolean
}

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
}: ModalProps) {
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
  
  // Séparer le ModalFooter des autres children si scrollable
  let contentChildren = children
  let footerElement: ReactNode = null
  
  if (scrollable) {
    const childrenArray = Children.toArray(children)
    const footerIndex = childrenArray.findIndex(
      (child) => {
        if (!isValidElement(child)) return false
        const childType = child.type as any
        return (
          childType === ModalFooter ||
          childType?.displayName === 'ModalFooter' ||
          (typeof childType === 'function' && childType.name === 'ModalFooter')
        )
      }
    )
    
    if (footerIndex !== -1) {
      footerElement = childrenArray[footerIndex]
      contentChildren = childrenArray.filter((_, index) => index !== footerIndex)
    }
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-black/50 z-[2000]"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-[2001] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              variants={modalAnimation}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                'border border-border-custom rounded-lg max-h-[95vh] pointer-events-auto flex flex-col shadow-lg',
                sizes[size],
                'w-full',
                !scrollable && 'p-6 overflow-auto'
              )}
              style={{ backgroundColor: '#18181a' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className={cn(
                  'flex items-center justify-between border-b border-border-custom flex-shrink-0',
                  scrollable ? 'p-6 pb-4' : 'mb-6 pb-4'
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
              <div className={cn(
                scrollable ? 'flex-1 overflow-y-auto min-h-0 px-6 py-4' : '',
                !scrollable && 'px-0'
              )}>
                {scrollable ? contentChildren : children}
              </div>
              
              {/* Footer (fixe en bas si scrollable) */}
              {scrollable && footerElement && (
                <ModalFooter scrollable={true}>
                  {isValidElement(footerElement) ? (footerElement as ReactElement<{ children?: ReactNode }>).props.children : null}
                </ModalFooter>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * ModalFooter - Footer du modal pour les actions
 * 
 * Affiche une barre en bas du modal avec les boutons d'action.
 * Peut être fixe (en mode scrollable) ou relative (en mode normal).
 * 
 * @example
 * ```tsx
 * <ModalFooter>
 *   <Button variant="secondary" onClick={onClose}>Annuler</Button>
 *   <Button variant="primary" onClick={onSave}>Enregistrer</Button>
 * </ModalFooter>
 * ```
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
        scrollable ? 'p-6 pt-4' : 'mt-6 pt-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

ModalFooter.displayName = 'ModalFooter'
