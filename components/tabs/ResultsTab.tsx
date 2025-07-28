import React from 'react';
import { DiagnosisResult } from '../DiagnosisResult';
import { LoadingSpinner, ErrorMessage, Button, ButtonGroup } from '../common';
import { DownloadPDFButton } from '../DownloadPDFButton';
import { DiagnosisResponse, IntermediateDiagnosisResponse } from '../../types';

interface ResultsTabProps {
  diagnosis: DiagnosisResponse | null;
  intermediateDiagnosis: IntermediateDiagnosisResponse | null;
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
  files: File[];
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  diagnosis,
  intermediateDiagnosis,
  isLoading,
  error,
  onReset,
  files
}) => {
  return (
    <div className="base-tab-form">
      <div className="base-form-section">
        <h2 className="base-section-title">3. Debugging results</h2>
        {(isLoading || error || diagnosis) && (
          <div>
            {isLoading && !intermediateDiagnosis && (
              <LoadingSpinner message="Debugging your plant... this may take a moment." />
            )}
            {isLoading && intermediateDiagnosis && (
              <LoadingSpinner 
                message={`Investigating possible bugs: ${intermediateDiagnosis.rankedDiagnoses.join(', ')}...`} 
              />
            )}
            {error && <ErrorMessage message={error} />}
            {diagnosis && <DiagnosisResult diagnosis={diagnosis} files={files} />}
          </div>
        )}
      </div>
      
      <ButtonGroup>
        <Button variant="reset" onClick={onReset}>
          Reset
        </Button>
        {diagnosis ? (
          <DownloadPDFButton 
            diagnosis={diagnosis} 
            files={files}
          />
        ) : (
          <Button disabled>
            Download
          </Button>
        )}
      </ButtonGroup>
    </div>
  );
};
