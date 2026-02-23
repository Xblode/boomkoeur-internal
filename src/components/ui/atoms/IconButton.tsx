import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from './Button';

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: LucideIcon | React.ReactNode;
  ariaLabel: string;
  children?: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, ariaLabel, size = 'md', ...props }, ref) => {
    // Override padding/size for icon only
    const sizeClasses = {
      xs: "h-6 w-6 p-0 flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5",
      sm: "h-8 w-8 p-0 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5",
      md: "h-10 w-10 p-0 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6",
      lg: "h-12 w-12 p-0 flex items-center justify-center [&>svg]:w-7 [&>svg]:h-7",
    };

    // Rendre l'icône : soit c'est déjà un élément React, soit c'est un composant à instancier
    const renderIcon = () => {
      // Si c'est déjà un élément React valide (ex: <Eye />)
      if (React.isValidElement(icon)) {
        return icon;
      }
      
      // Si c'est un composant Lucide ou autre (ex: Eye)
      // On utilise createElement pour l'instancier
      return React.createElement(icon as React.ComponentType);
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cn(sizeClasses[size], className)}
        aria-label={ariaLabel}
        {...props}
      >
        {renderIcon()}
      </Button>
    );
  }
);
IconButton.displayName = "IconButton";
