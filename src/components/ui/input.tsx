import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isInvalid = false, ...props }, ref) => {
    const styles = isInvalid
      ? 'border-error-300 shadow-destructive focus-visible:outline-none'
      : 'focus-visible:outline-primary-500';

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full bg-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border outline-offset-1 border-gray-300 focus-visible:border-transparent bg-white py-[0.625rem] px-[0.875rem] text-gray-500 text-base rounded-lg',
          className,
          styles
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
