import React from 'react';
import styles from '../../styles/Home.module.css';

interface HeaderProps {
  isCompact: boolean;
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isCompact, onLogoClick }) => {
  return (
    <header className={`${styles.header} ${isCompact ? styles.headerCompact : ''}`}>
      <div className={styles.logoTitleContainer}>
        <img 
          src="/logo.png" 
          alt="Plant Debug Logo" 
          className={styles.logo}
          onClick={onLogoClick}
        />
        <div className={styles.titleContainer}>
          <h1 
            className={styles.title}
            onClick={onLogoClick}
          >
            Plant Debugger
          </h1>
        </div>
      </div>
      <p className={styles.description}>
        Upload photos of your sad plant and provide some context to start debugging.
      </p>
    </header>
  );
};