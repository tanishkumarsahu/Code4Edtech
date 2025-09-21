/**
 * Button Component
 * Reusable button component with variants and sizes
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const baseClasses = cn(
      // Base button styles
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      'disabled:pointer-events-none disabled:opacity-50',
      
      // Variants
      {
        'btn-primary': variant === 'default',
        'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90': variant === 'destructive',
        'btn-outline': variant === 'outline',
        'btn-secondary': variant === 'secondary',
        'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
        'text-primary underline-offset-4 hover:underline': variant === 'link',
      },
      
      // Sizes (override btn-* classes if needed)
      {
        'h-9 px-4 py-2': size === 'default',
        'h-8 rounded-md px-3 text-xs': size === 'sm',
        'h-10 rounded-md px-8': size === 'lg',
        'h-9 w-9 p-0': size === 'icon',
      },
      
      className
    );

    if (asChild) {
      return <span className={baseClasses} {...props} />;
    }

    return (
      <button
        className={baseClasses}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
