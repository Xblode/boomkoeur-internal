import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Variants - toutes utilisent bg-card-bg et border-border-custom (thème).
 * Différences : radius, shadow, overflow.
 */
const CARD_VARIANTS = {
  default: "rounded-md border border-border-custom bg-card-bg text-foreground shadow-sm",
  poster: "rounded-md border border-border-custom bg-card-bg text-foreground shadow-sm overflow-hidden",
  editable: "rounded-md border border-border-custom bg-card-bg text-foreground overflow-hidden",
  outline: "rounded-md border border-border-custom bg-transparent text-foreground overflow-hidden",
  list: "rounded-md border border-zinc-800 bg-card-bg text-foreground overflow-hidden",
  settings: "rounded-md border border-border-custom bg-card-bg text-foreground shadow-sm overflow-hidden",
} as const

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  /** default = thème light/dark | poster = style carte poster (EventCard) */
  variant?: keyof typeof CARD_VARIANTS;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, description, variant = "default", children, ...props }, ref) => {
    const variantStyles = CARD_VARIANTS[variant]

    // Si un titre ou une description est fourni, on utilise le layout "Section"
    if (title || description) {
      const innerClasses = variant === "settings"
        ? "rounded-lg border border-border-custom bg-card-bg text-foreground shadow-sm overflow-hidden"
        : "rounded-md border border-border-custom bg-card-bg text-foreground shadow-sm"
      return (
        <div ref={ref} className={cn("space-y-4", className)} {...props}>
          <div>
            {title && <h3 className="text-lg font-medium text-foreground">{title}</h3>}
            {description && <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
          </div>
          <div className={innerClasses}>
            {children}
          </div>
        </div>
      )
    }

    // Sinon comportement standard (juste la boîte)
    return (
      <div
        ref={ref}
        className={cn(variantStyles, className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

const CARD_MEDIA_ASPECT = {
  video: "aspect-video",
  square: "aspect-square",
} as const

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: keyof typeof CARD_MEDIA_ASPECT;
  /** Quand true, applique le fond placeholder (icône vide, pas d'image) */
  placeholder?: boolean;
}

const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  ({ className, aspectRatio = "video", placeholder = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-md flex items-center justify-center",
        placeholder && "bg-zinc-200 dark:bg-zinc-800/80",
        CARD_MEDIA_ASPECT[aspectRatio],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
CardMedia.displayName = "CardMedia"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CARD_FOOTER_BORDERS = {
  default: "border-t border-border-custom",
  poster: "border-t border-border-custom",
  editable: "border-t-2 border-dashed border-border-custom",
  outline: "border-t border-border-custom",
  list: "border-t border-zinc-800",
  settings: "border-t border-border-custom",
} as const

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof CARD_FOOTER_BORDERS;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center px-6 py-4 flex-shrink-0",
        CARD_FOOTER_BORDERS[variant],
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardMedia }
