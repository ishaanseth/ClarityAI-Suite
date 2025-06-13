
import React from 'react';

interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const baseStyle = 'p-4 rounded-md flex items-center justify-between shadow';
  const typeStyles = {
    error: 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/70 dark:border-red-700 dark:text-red-300',
    success: 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/70 dark:border-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700 dark:bg-yellow-800/70 dark:border-yellow-700 dark:text-yellow-300',
    info: 'bg-blue-100 border border-blue-400 text-blue-700 dark:bg-blue-900/70 dark:border-blue-700 dark:text-blue-300',
  };
  const iconStyles = {
    error: 'fas fa-exclamation-circle',
    success: 'fas fa-check-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
  }

  return (
    <div className={`${baseStyle} ${typeStyles[type]} my-4`} role="alert">
      <div>
        <i className={`${iconStyles[type]} mr-2`}></i>
        {message}
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className={`ml-4 text-lg font-semibold hover:opacity-75 
                      ${type === 'error' ? 'text-red-700 dark:text-red-300' : ''}
                      ${type === 'success' ? 'text-green-700 dark:text-green-300' : ''}
                      ${type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' : ''}
                      ${type === 'info' ? 'text-blue-700 dark:text-blue-300' : ''}
                    `} 
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};