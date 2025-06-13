
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: string; // Font Awesome class, e.g., 'fas fa-upload'
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  ...props
}) => {
  const baseStyle = 'font-semibold rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center dark:focus:ring-offset-neutral-darker';
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary dark:hover:bg-primary-dark dark:focus:ring-primary-light',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary dark:hover:bg-secondary-dark dark:focus:ring-secondary-light',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 dark:hover:bg-red-700 dark:focus:ring-red-400',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary dark:text-primary-light dark:border-primary-light dark:hover:bg-primary-light dark:hover:text-neutral-darker dark:focus:ring-primary-light',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <i className="fas fa-spinner fa-spin mr-2"></i>}
      {icon && !isLoading && <i className={`${icon} mr-2`}></i>}
      {children}
    </button>
  );
};