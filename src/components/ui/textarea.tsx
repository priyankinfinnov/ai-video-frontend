import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isInvalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isInvalid, ...props }, ref) => {
    const styles = isInvalid
      ? 'border-error-300 shadow-destructive focus-visible:outline-none'
      : 'focus-visible:outline-primary-500';
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full border-input bg-background ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border border-gray-300 bg-white py-[0.625rem] px-[0.875rem] text-gray-500 text-base rounded-lg h-[6.75rem] resize-none',
          className,
          styles
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
