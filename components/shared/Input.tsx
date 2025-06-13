
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string; // Font Awesome class
}

export const Input: React.FC<InputProps> = ({ label, id, error, icon, className, ...props }) => {
  return (
    <div className="mb-4 w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-neutral-dark dark:text-neutral-light-accent mb-1">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-gray-500"><i className={icon}></i></span>}
        <input
          id={id}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 dark:text-neutral-light-accent
                     focus:outline-none focus:ring-primary focus:border-primary sm:text-sm
                     dark:focus:ring-primary-light dark:focus:border-primary-light
                     ${icon ? 'pl-10' : ''}
                     ${error ? 'border-red-500 text-red-700 focus:ring-red-500 focus:border-red-500 dark:border-red-400 dark:text-red-400 dark:focus:ring-red-400 dark:focus:border-red-400' 
                             : 'border-neutral-DEFAULT dark:border-gray-600'}
                     ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};