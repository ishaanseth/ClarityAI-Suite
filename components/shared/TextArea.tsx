
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, error, className, ...props }) => {
  return (
    <div className="mb-4 w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-neutral-dark dark:text-neutral-light-accent mb-1">{label}</label>}
      <textarea
        id={id}
        rows={4}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 dark:text-neutral-light-accent
                   focus:outline-none focus:ring-primary focus:border-primary sm:text-sm
                   dark:focus:ring-primary-light dark:focus:border-primary-light
                   ${error ? 'border-red-500 text-red-700 focus:ring-red-500 focus:border-red-500 dark:border-red-400 dark:text-red-400 dark:focus:ring-red-400 dark:focus:border-red-400' 
                           : 'border-neutral-DEFAULT dark:border-gray-600'}
                   ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};