import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import { usePlantForm } from '../hooks/usePlantForm';
import { useTabNavigation } from '../hooks/useTabNavigation';
import { TabBar } from '../components/common';
import { UploadTab, InfoTab, ResultsTab } from '../components/tabs';

const Home: NextPage = () => {
  const {
    formState,
    files,
    setFiles,
    diagnosis,
    intermediateDiagnosis,
    isLoading,
    error,
    plantNameLoading,
    handleFormChange,
    resetForm,
    identifyPlantName,
    submitDiagnosis,
  } = usePlantForm();

  const { 
    activeTab, 
    canNavigateToTabViaButton, 
    navigateForward, 
    navigateViaButton, 
    resetNavigation 
  } = useTabNavigation();
  
  const [headerCompact, setHeaderCompact] = useState(false);
  const [compactActivated, setCompactActivated] = useState(false); // Track if compact has been activated
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

  const handleNextWithPlantName = async () => {
    // On mobile, activate compact header on first navigation
    if (isMobile && !compactActivated) {
      setHeaderCompact(true);
      setCompactActivated(true);
    }
    navigateForward(1, files.length, !!diagnosis);
    await identifyPlantName();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    navigateForward(2, files.length, true); // Allow navigation to results tab when submitting
    await submitDiagnosis();
  };

  const handleReset = () => {
    resetForm();
    resetNavigation();
    setHeaderCompact(false); // Back to full header
    setCompactActivated(false); // Reset compact activation state
  };

  const handleTabChange = (tab: typeof activeTab) => {
    // Only allow navigation to previously reached tabs (backward navigation)
    navigateViaButton(tab);
    
    // Header behavior logic:
    // - On desktop: always keep header big
    // - On mobile: once compact is activated, keep it compact until reset
    if (isMobile) {
      if (tab > 0 && !compactActivated) {
        // First time navigating to tab 1+ on mobile
        setHeaderCompact(true);
        setCompactActivated(true);
      } else if (compactActivated) {
        // Keep compact if it was already activated
        setHeaderCompact(true);
      } else {
        // Tab 0 and compact not yet activated
        setHeaderCompact(false);
      }
    } else {
      // Desktop: always keep header big
      setHeaderCompact(false);
    }
  };

  const handleLogoClick = () => {
    // Navigate back to first tab without resetting form data
    navigateViaButton(0);
    
    // Adjust header behavior for mobile when going back to tab 0
    if (isMobile && compactActivated) {
      setHeaderCompact(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <UploadTab
            files={files}
            onFilesChange={setFiles}
            onNext={handleNextWithPlantName}
            onReset={handleReset}
            plantNameLoading={plantNameLoading}
          />
        );
      case 1:
        return (
          <InfoTab
            formState={formState}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
            isLoading={isLoading}
            plantNameLoading={plantNameLoading}
          />
        );
      case 2:
        return (
          <ResultsTab
            diagnosis={diagnosis}
            intermediateDiagnosis={intermediateDiagnosis}
            isLoading={isLoading}
            error={error}
            onReset={handleReset}
            files={files}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <header className={`${styles.header} ${headerCompact ? styles.headerCompact : ''}`}>
          <div className={styles.logoTitleContainer}>
            <img 
              src="/logo.png" 
              alt="Plant Debug Logo" 
              className={styles.logo}
              onClick={handleLogoClick}
              style={{ cursor: 'pointer' }}
            />
            <div className={styles.titleContainer}>
              <h1 
                className={styles.title}
                onClick={handleLogoClick}
                style={{ cursor: 'pointer' }}
              >
                Plant Debugger
              </h1>
            </div>
          </div>
          <p className={styles.description}>
            Upload pictures of your sad plant and provide some context to start debugging.
          </p>
        </header>

        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          canNavigateToTab={canNavigateToTabViaButton}
        />

        <div className={`${styles.tabContent} ${headerCompact ? styles.tabContentCompact : ''}`}>
          {renderTabContent()}
        </div>
      </main>

      <footer className={styles.footer}>
        <p></p>
      </footer>
    </div>
  );
};

export default Home;