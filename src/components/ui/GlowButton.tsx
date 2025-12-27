import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = true, children, disabled, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center font-display font-semibold tracking-wide transition-all duration-300 overflow-hidden group hover:scale-[1.02] active:scale-[0.98]";
    
    const variants = {
      primary: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-glow",
      secondary: "bg-gradient-to-r from-secondary to-purple-600 text-secondary-foreground hover:shadow-glow-secondary",
      outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10 hover:shadow-glow-sm",
      ghost: "bg-transparent text-foreground hover:bg-muted/50",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-lg",
      md: "px-6 py-3 text-base rounded-xl",
      lg: "px-8 py-4 text-lg rounded-2xl",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], disabled && "opacity-50 cursor-not-allowed hover:scale-100", className)}
        disabled={disabled}
        {...props}
      >
        <span className="absolute inset-0 overflow-hidden rounded-inherit">
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />
        </span>
        
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        
        {glow && (
          <span className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-inherit" />
        )}
      </button>
    );
  }
);

GlowButton.displayName = 'GlowButton';
