import React from 'react';
import ContextForm from '../ContextForm';
import { Button, ButtonGroup } from '../common';
import { DiagnosisFormState } from '../../types';
import styles from '../../styles/InfoTab.module.css';

interface InfoTabProps {
  formState: DiagnosisFormState;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  isLoading: boolean;
  plantNameLoading: boolean;
}

export const InfoTab: React.FC<InfoTabProps> = ({
  formState,
  onFormChange,
  onSubmit,
  onReset,
  isLoading,
  plantNameLoading
}) => {
  // Check if plant has been identified
  const isPlantIdentified = formState.plantType.trim() !== '';
  
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>2. Provide details (optional)</h2>
        <ContextForm
          formState={formState}
          onFormChange={onFormChange}
          plantNameLoading={plantNameLoading}
        />
      </div>
      
      <ButtonGroup>
        <Button variant="reset" onClick={onReset}>
          Reset
        </Button>
        <Button 
          type="submit"
          disabled={!isPlantIdentified}
        >
          Debug
        </Button>
      </ButtonGroup>
    </form>
  );
};
