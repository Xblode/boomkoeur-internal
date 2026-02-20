import { Button } from '@/components/ui/atoms'
import { Plus, FileUp, FileDown, Settings } from 'lucide-react'
import { ReactNode } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'

interface ActionButton {
  label: string
  icon: any
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  className?: string
}

interface ActionButtonsProps {
  buttons: ActionButton[]
  className?: string
}

function ActionButtons({ buttons, className = '' }: ActionButtonsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {buttons.map((button, index) => {
        const Icon = button.icon
        return (
          <Button
            key={index}
            variant={button.variant || 'secondary'}
            size="sm"
            onClick={button.onClick}
            className={button.className}
          >
            <Icon className="w-4 h-4 mr-2" />
            {button.label}
          </Button>
        )
      })}
    </div>
  )
}

export default ActionButtons
export { ActionButtons }