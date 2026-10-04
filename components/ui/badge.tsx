import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-mono tracking-tight font-medium transition-colors border',
  {
    variants: {
      variant: {
        default:
          'border-zinc-800 bg-zinc-900 text-zinc-300',
        secondary:
          'border-zinc-850 bg-zinc-950 text-zinc-400',
        outline:
          'border-zinc-800 text-zinc-400 bg-transparent',
        urgent:
          'border-amber-900/60 bg-amber-950/40 text-amber-300',
        danger:
          'border-red-900/60 bg-red-950/40 text-red-300',
        success:
          'border-emerald-900/60 bg-emerald-950/40 text-emerald-300',
        info:
          'border-zinc-700 bg-zinc-800 text-zinc-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
