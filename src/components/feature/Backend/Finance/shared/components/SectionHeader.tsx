import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { Heading } from '@/components/ui/atoms'

interface SectionHeaderProps {
  icon?: LucideIcon | string
  title: string
  actions?: ReactNode
  className?: string
}

function SectionHeader({ 
  icon, 
  title, 
  actions, 
  className = '' 
}: SectionHeaderProps) {
  const renderIcon = () => {
    if (!icon) return null
    
    if (typeof icon === 'string') {
      return (
        <motion.span 
          className="text-2xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          {icon}
        </motion.span>
      )
    }
    
    const Icon = icon as LucideIcon
    return (
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="p-2 bg-accent/10 rounded-lg"
      >
        <Icon className="w-5 h-5 text-accent" />
      </motion.div>
    )
  }

  return (
    <motion.div 
      className={`flex flex-row items-center justify-between mb-6 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        {renderIcon()}
        <Heading level={3} className="uppercase tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
          {title}
        </Heading>
      </div>
      {actions && (
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {actions}
        </motion.div>
      )}
    </motion.div>
  )
}

export default SectionHeader
export { SectionHeader }

