import { useState } from 'react';

export type TabIndex = 0 | 1 | 2;

export const useTabNavigation = () => {
  const [activeTab, setActiveTab] = useState<TabIndex>(0);
  const [maxReachedTab, setMaxReachedTab] = useState<TabIndex>(0);

  const canNavigateToTab = (index: TabIndex, filesCount: number, hasDiagnosis: boolean): boolean => {
    switch (index) {
      case 0:
        return true;
      case 1:
        return filesCount > 0;
      case 2:
        return hasDiagnosis;
      default:
        return false;
    }
  };

  // For tab button clicks - only allow backward navigation to previously reached tabs
  const canNavigateToTabViaButton = (index: TabIndex): boolean => {
    return index <= maxReachedTab;
  };

  const navigateToTab = (index: TabIndex, filesCount: number, hasDiagnosis: boolean) => {
    if (canNavigateToTab(index, filesCount, hasDiagnosis)) {
      setActiveTab(index);
      // Update max reached tab if we're going forward
      if (index > maxReachedTab) {
        setMaxReachedTab(index);
      }
    }
  };

  // For programmatic navigation (Next button) - allows forward movement
  const navigateForward = (index: TabIndex, filesCount: number, hasDiagnosis: boolean) => {
    if (canNavigateToTab(index, filesCount, hasDiagnosis)) {
      setActiveTab(index);
      if (index > maxReachedTab) {
        setMaxReachedTab(index);
      }
    }
  };

  // For tab button navigation - only allows backward movement
  const navigateViaButton = (index: TabIndex) => {
    if (canNavigateToTabViaButton(index)) {
      setActiveTab(index);
    }
  };

  const resetNavigation = () => {
    setActiveTab(0);
    setMaxReachedTab(0);
  };

  return {
    activeTab,
    setActiveTab,
    maxReachedTab,
    canNavigateToTab,
    canNavigateToTabViaButton,
    navigateToTab,
    navigateForward,
    navigateViaButton,
    resetNavigation,
  };
};
