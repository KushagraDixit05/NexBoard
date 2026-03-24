import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input-field ${error ? 'border-danger-500 focus:ring-danger-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;
