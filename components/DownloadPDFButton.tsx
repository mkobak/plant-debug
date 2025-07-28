import React, { useState } from 'react';
import { Button } from './common';
import { generatePDF } from '../utils/pdfGenerator';
import { DiagnosisResponse } from '../types';

interface DownloadPDFButtonProps {
  diagnosis: DiagnosisResponse;
  files: File[];
  className?: string;
  style?: React.CSSProperties;
}

export const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({
  diagnosis,
  files,
  className,
  style
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
    <Button
      variant="primary"
      onClick={handleDownload}
      disabled={isGenerating}
      title={error || "Download a PDF report of the plant diagnosis"}
      style={style}
      className={className}
    >
      {isGenerating ? 'Generating report...' : 'Download'}
    </Button>
  );
};
