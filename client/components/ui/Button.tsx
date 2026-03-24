import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   'primary' | 'secondary' | 'danger' | 'ghost';
  size?:      'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?:      React.ReactNode;
}

const variantClasses = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  ghost:     'btn-ghost',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  variant = 'primary', size = 'md', isLoading, icon, children, disabled, className = '', ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {isLoading ? (
        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : icon}
      {children}
    </button>
  );
}
