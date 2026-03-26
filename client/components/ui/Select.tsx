import React, { forwardRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectProps {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ label, error, options, value, onChange, placeholder = 'Select an option...', className = '' }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <SelectPrimitive.Root value={value} onValueChange={onChange}>
          <SelectPrimitive.Trigger
            ref={ref}
            className={`w-full flex items-center justify-between px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring ${error ? 'border-destructive focus:ring-destructive' : ''} ${className}`}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content className="overflow-hidden bg-popover border border-border rounded-md shadow-card-hover z-50">
              <SelectPrimitive.Viewport className="p-1">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className="flex items-center justify-between px-3 py-2 text-sm text-foreground rounded-md cursor-pointer hover:bg-muted focus:bg-accent focus:outline-none focus:text-accent-foreground select-none data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                  >
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator>
                      <Check className="w-4 h-4 text-primary" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export default Select;
