import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

export interface DropdownItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export default function Dropdown({ trigger, items, align = 'end', className = '' }: DropdownProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild className="focus:outline-none">
        {trigger}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={8}
          className={`min-w-[160px] bg-white rounded-lg shadow-card-hover border border-gray-100 p-1 z-50 animate-in fade-in zoom-in-95 ${className}`}
        >
          {items.map((item, index) => (
            <DropdownMenuPrimitive.Item
              key={index}
              onClick={item.onClick}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer outline-none transition-colors
                ${item.danger 
                  ? 'text-danger-600 hover:bg-danger-50 focus:bg-danger-50' 
                  : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100'
                }`}
            >
              {item.icon && <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
