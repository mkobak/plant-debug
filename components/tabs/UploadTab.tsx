import React from 'react';
import ImageUploader from '../ImageUploader';
import { Button, ButtonGroup } from '../common';
import styles from '../../styles/UploadTab.module.css';

interface UploadTabProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onNext: () => void;
  onReset: () => void;
  plantNameLoading: boolean;
}

export const UploadTab: React.FC<UploadTabProps> = ({
  files,
  onFilesChange,
  onNext,
  onReset,
  plantNameLoading
}) => {
  return (
    <form className={`base-tab-form ${styles.form}`} onSubmit={e => e.preventDefault()}>
      <div className={`base-form-section ${styles.formSection}`}>
        <h2 className={`base-section-title ${styles.sectionTitle}`}>1. Upload images</h2>
        <div className={`base-tip ${styles.tip}`}>
          <strong>Tip:</strong> For best results, upload clear, well-lit photos showing the affected parts of your plant.
        </div>
        <ImageUploader files={files} onFilesChange={onFilesChange} />
      </div>
      
      <ButtonGroup>
        <Button variant="reset" onClick={onReset}>
          Reset
        </Button>
        <Button 
          disabled={files.length === 0}
          onClick={onNext}
        >
          Next
        </Button>
      </ButtonGroup>
    </form>
  );
};
