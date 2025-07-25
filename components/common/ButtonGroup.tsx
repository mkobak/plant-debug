import React from 'react';
import styles from '../../styles/ButtonGroup.module.css';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`${styles.buttonGroup} ${className}`}>
      {children}
    </div>
  );
};
