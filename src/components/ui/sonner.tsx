"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/90 group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-sm group-[.toaster]:transition-all group-[.toaster]:duration-300",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90 group-[.toast]:transition-colors",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-emerald-500/5 group-[.toaster]:shadow-[0_0_20px_oklch(0.696_0.17_162.48/8%)]",
          error:
            "group-[.toaster]:border-red-500/30 group-[.toaster]:bg-red-500/5 group-[.toaster]:shadow-[0_0_20px_oklch(0.6_0.2_25/8%)]",
          warning:
            "group-[.toaster]:border-amber-500/30 group-[.toaster]:bg-amber-500/5 group-[.toaster]:shadow-[0_0_20px_oklch(0.75_0.15_75/8%)]",
          info:
            "group-[.toaster]:border-violet-500/30 group-[.toaster]:bg-violet-500/5 group-[.toaster]:shadow-[0_0_20px_oklch(0.65_0.18_280/8%)]",
          loading:
            "group-[.toaster]:border-primary/30 group-[.toaster]:bg-primary/5",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "oklch(0.25 0.04 162)",
          "--success-border": "oklch(0.696 0.17 162.48 / 30%)",
          "--success-text": "oklch(0.85 0.1 162)",
          "--error-bg": "oklch(0.25 0.06 25)",
          "--error-border": "oklch(0.6 0.2 25 / 30%)",
          "--error-text": "oklch(0.85 0.1 25)",
          "--warning-bg": "oklch(0.25 0.04 75)",
          "--warning-border": "oklch(0.75 0.15 75 / 30%)",
          "--warning-text": "oklch(0.85 0.1 75)",
          "--info-bg": "oklch(0.25 0.04 280)",
          "--info-border": "oklch(0.65 0.18 280 / 30%)",
          "--info-text": "oklch(0.85 0.1 280)",
        } as React.CSSProperties
      }
      richColors
      closeButton
      position="bottom-right"
      duration={4000}
      {...props}
    />
  )
}

export { Toaster }
