import { useState, useEffect } from 'react';

export const useHeaderState = () => {
  const [headerCompact, setHeaderCompact] = useState(false);
  const [compactActivated, setCompactActivated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Hook to detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activateCompactHeader = () => {
    if (isMobile && !compactActivated) {
      setHeaderCompact(true);
      setCompactActivated(true);
    }
  };

  const updateHeaderForTab = (tab: number) => {
    if (isMobile) {
      if (tab > 0 && !compactActivated) {
        setHeaderCompact(true);
        setCompactActivated(true);
      } else if (compactActivated) {
        setHeaderCompact(true);
      } else {
        setHeaderCompact(false);
      }
    } else {
      setHeaderCompact(false);
    }
  };

  const handleLogoClick = () => {
    if (isMobile && compactActivated) {
      setHeaderCompact(false);
    }
  };

  const resetHeaderState = () => {
    setHeaderCompact(false);
    setCompactActivated(false);
  };

  return {
    headerCompact,
    isMobile,
    activateCompactHeader,
    updateHeaderForTab,
    handleLogoClick,
    resetHeaderState,
  };
};