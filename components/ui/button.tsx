import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-zinc-100 text-zinc-950 shadow-xs hover:bg-white active:bg-zinc-200 border border-zinc-200/20 font-semibold',
        secondary:
          'bg-zinc-900 text-zinc-100 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 active:bg-zinc-850',
        outline:
          'border border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-700',
        ghost:
          'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 active:bg-zinc-800',
        destructive:
          'bg-red-950/40 text-red-300 border border-red-900/60 hover:bg-red-900/50 hover:text-red-200',
        link: 'text-zinc-300 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-8 px-3 py-1.5',
        xs: 'h-6 px-2 text-[11px] rounded',
        sm: 'h-7 px-2.5 text-xs',
        lg: 'h-9 px-4 text-sm',
        icon: 'h-8 w-8',
        'icon-sm': 'h-7 w-7',
        'icon-xs': 'h-6 w-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
