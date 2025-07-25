import React from 'react';
import styles from '../../styles/ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = '' }) => {
  return (
    <div className={`${styles.error} ${className}`}>
      {message}
    </div>
  );
};
