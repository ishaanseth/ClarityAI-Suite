
import React from 'react';

interface ResultCardProps {
  title: string;
  icon?: string; // Font Awesome class
  children: React.ReactNode;
  className?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children, className }) => {
  return (
    <div className={`mt-6 bg-emerald-50 dark:bg-emerald-900/50 p-6 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold text-secondary-dark dark:text-secondary-light mb-3">
        {icon && <i className={`${icon} mr-2`}></i>}
        {title}
      </h3>
      <div className="text-neutral-dark dark:text-neutral-light-accent space-y-2">
        {children}
      </div>
    </div>
  );
};