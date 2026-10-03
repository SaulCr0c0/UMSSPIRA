import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';