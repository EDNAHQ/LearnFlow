export const AI_STYLES = {
  colors: {
    primary: 'brand-primary',
    accent: 'brand-accent',
    surface: 'ai-surface',
    border: 'ai-border',
  },

  gradients: {
    brand: 'bg-gradient-to-r from-brand-primary to-brand-accent',
    brandLight: 'bg-gradient-to-r from-brand-primary/10 to-brand-accent/10',
    text: 'bg-gradient-to-r from-brand-primary via-brand-accent to-brand-highlight bg-clip-text text-transparent',
  },

  backgrounds: {
    surface: 'bg-brand-primary/5',
    card: 'bg-white',
    hover: 'hover:bg-brand-primary/10',
  },

  borders: {
    default: 'border border-brand-primary/20',
    hover: 'hover:border-brand-primary/30',
  },

  text: {
    primary: 'text-brand-primary',
    accent: 'text-brand-accent',
    muted: 'text-gray-600',
    body: 'text-gray-800',
  },

  buttons: {
    ai: 'bg-brand-primary text-white hover:bg-brand-primary/90',
    aiOutline: 'border border-brand-primary/20 text-brand-primary hover:bg-brand-primary/10',
  },

  animations: {
    spinner: 'animate-spin text-brand-primary',
    pulse: 'animate-pulse',
  },
} as const;

export const AI_ICONS = {
  default: 'Sparkles',
  size: {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  },
} as const;

export const AI_DIALOG_SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
} as const;