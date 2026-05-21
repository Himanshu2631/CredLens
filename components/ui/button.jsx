import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Reusable, premium button component built on top of Base UI's primitive.
 * Formulated with Tailwind v4 theme variables and a high-polish, restrained aesthetic.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 active:translate-y-[0.5px] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        // Primary CTA: Solid white background with black text, subtle hover dimming
        default:
          "bg-primary text-primary-foreground border border-transparent hover:bg-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        // Secondary CTA: Slate-gray dark background with light text and subtle border
        secondary:
          "bg-secondary text-secondary-foreground border border-border/40 hover:bg-zinc-800/80 hover:text-white shadow-[0_1px_1px_rgba(0,0,0,0.2)]",
        // Outline: Transparent background with clear border, shifts to solid on hover
        outline:
          "bg-transparent text-zinc-300 border border-border hover:bg-secondary hover:text-white",
        // Ghost: Uncluttered borderless background, highlight on hover
        ghost:
          "bg-transparent text-muted-foreground hover:bg-secondary/40 hover:text-white",
        // Destructive: Crimson accent for warning actions
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90 shadow-[0_1px_2px_rgba(0,0,0,0.1)]",
        // Link: Styled underline text link
        link:
          "text-primary underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        default: "h-9 px-4 py-2 gap-1.5",
        sm: "h-8 px-3 py-1 text-[11px] gap-1 rounded-md",
        lg: "h-10 px-5 py-2.5 text-sm gap-2 rounded-md",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
