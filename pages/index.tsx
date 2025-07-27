import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import { usePlantForm } from '../hooks/usePlantForm';
import { useTabNavigation } from '../hooks/useTabNavigation';
import { useHeaderState } from '../hooks/useHeaderState';
import { TabBar, Header } from '../components/common';
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
  
  const {
    headerCompact,
    isMobile,
    activateCompactHeader,
    updateHeaderForTab,
    handleLogoClick: handleHeaderLogoClick,
    resetHeaderState,
  } = useHeaderState();

  const handleNextWithPlantName = async () => {
    activateCompactHeader();
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
    resetHeaderState();
  };

  const handleTabChange = (tab: typeof activeTab) => {
    navigateViaButton(tab);
    updateHeaderForTab(tab);
  };

  const handleLogoClick = () => {
    navigateViaButton(0);
    handleHeaderLogoClick();
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
        <Header isCompact={headerCompact} onLogoClick={handleLogoClick} />

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