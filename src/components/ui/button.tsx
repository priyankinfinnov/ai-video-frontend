import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

//  shadows not working and its pending, have to figure out.
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary-600 text-white hover:bg-primary-700 focus:bg-primary-600 focus:shadow-primary',
        secondary:
          'bg-primary-50 text-primary-700 hover:bg-primary-100 focus:bg-primary-50 focus:shadow-primary',
        'secondary-gray':
          'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 focus:shadow-gray',
        tertiary: 'bg-transparent text-primary-700 hover:bg-primary-50',
        'tertiary-gray':
          'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-600',
        link: 'bg-transparent text-primary-700 hover:text-primary-800',
        'link-gray': 'bg-transparent text-gray-500 hover:text-gray-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'py-2 px-[14px] font-semibold py-2 px-[14px] font-semibold text-sm',
        md: 'py-[10px] px-4 font-semibold text-sm',
        lg: 'py-[10px] px-[18px] font-semibold text-base',
        xl: 'py-3 px-5 font-semibold text-base',
        '2xl': 'py-4 px-7 font-semibold text-lg',
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
