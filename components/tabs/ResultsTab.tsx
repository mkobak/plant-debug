import React from 'react';
import { DiagnosisResult } from '../DiagnosisResult';
import { LoadingSpinner, ErrorMessage, Button } from '../common';
import { DiagnosisResponse, IntermediateDiagnosisResponse } from '../../types';
import styles from '../../styles/ResultsTab.module.css';

interface ResultsTabProps {
  diagnosis: DiagnosisResponse | null;
  intermediateDiagnosis: IntermediateDiagnosisResponse | null;
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  diagnosis,
  intermediateDiagnosis,
  isLoading,
  error,
  onReset
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>3. Debugging results</h2>
      </div>
      <div className={styles.content}>
        {isLoading && !intermediateDiagnosis && (
          <LoadingSpinner message="Debugging your plant... this may take a moment." />
        )}
        {isLoading && intermediateDiagnosis && (
          <LoadingSpinner 
            message={`Investigating possible bugs: ${intermediateDiagnosis.rankedDiagnoses.join(', ')}.`} 
          />
        )}
        {error && <ErrorMessage message={error} />}
        {diagnosis && <DiagnosisResult diagnosis={diagnosis} />}
      </div>
      
      <div className={styles.actions}>
        <Button variant="reset" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
};
