import React from 'react';
import ImageUploader from '../ImageUploader';
import { Button, ButtonGroup } from '../common';

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
    <form className="base-tab-form" onSubmit={e => e.preventDefault()}>
      <div className="base-form-section">
        <h2 className="base-section-title">1. Upload photos</h2>
        <div className="base-tip">
          <strong>Tip:</strong> For best results, upload clear, well-lit photos showing the whole plant and close-ups of any affected parts.
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
