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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <SelectPrimitive.Root value={value} onValueChange={onChange}>
          <SelectPrimitive.Trigger
            ref={ref}
            className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-danger-500 focus:ring-danger-500' : ''} ${className}`}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-card-hover z-50">
              <SelectPrimitive.Viewport className="p-1">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer hover:bg-gray-100 focus:bg-primary-50 focus:outline-none focus:text-primary-700 select-none data-[state=checked]:bg-primary-50 data-[state=checked]:text-primary-700"
                  >
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator>
                      <Check className="w-4 h-4 text-primary-600" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
        {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export default Select;
