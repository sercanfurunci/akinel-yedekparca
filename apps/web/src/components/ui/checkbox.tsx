'use client';

import * as React from 'react';
import { cn } from 'cn';

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, checked, onCheckedChange, disabled, className }, ref) => {
    return (
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked ?? false}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        className={cn(
          'h-4 w-4 shrink-0 rounded border border-input cursor-pointer accent-brand mt-0.5',
          className
        )}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
