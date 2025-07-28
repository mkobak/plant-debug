import React, { useState } from 'react';
import { Button } from './common';
import { generatePDF } from '../utils/pdfGenerator';
import { DiagnosisResponse } from '../types';

interface DownloadPDFButtonProps {
  diagnosis: DiagnosisResponse;
  files: File[];
  className?: string;
}

export const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({
  diagnosis,
  files,
  className
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      await generatePDF(diagnosis, files);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
      setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <Button
        variant="primary"
        onClick={handleDownload}
        disabled={isGenerating}
        className={className}
        title="Download a PDF report of the plant diagnosis"
      >
        {isGenerating ? 'Generating report...' : 'Download'}
      </Button>
      {error && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '5px',
          padding: '5px 10px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          {error}
        </div>
      )}
    </div>
  );
};
