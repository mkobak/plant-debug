import React from 'react';
import { TabIndex } from '../../hooks/useTabNavigation';
import styles from '../../styles/TabBar.module.css';

interface TabBarProps {
  activeTab: TabIndex;
  onTabChange: (tab: TabIndex) => void;
  canNavigateToTab: (index: TabIndex) => boolean;
}

const TAB_NAMES = [
  '1. Upload \n photos',
  '2. Provide \n details',
  '3. Debugging \n results',
];

export const TabBar: React.FC<TabBarProps> = ({ 
  activeTab, 
  onTabChange, 
  canNavigateToTab 
}) => {
  return (
    <nav className={styles.tabBar}>
      {TAB_NAMES.map((name, idx) => {
        const tabIndex = idx as TabIndex;
        const enabled = canNavigateToTab(tabIndex);
        const isActive = activeTab === tabIndex;
        
        return (
          <button
            key={name}
            className={`${styles.tabButton} ${isActive ? styles.activeTab : ''}`}
            disabled={!enabled}
            onClick={() => enabled && onTabChange(tabIndex)}
          >
            {name}
          </button>
        );
      })}
    </nav>
  );
};
