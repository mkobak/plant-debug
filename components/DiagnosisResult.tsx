import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { DiagnosisResponse } from '../types';
import { ImageModal } from './common';
import styles from '../styles/DiagnosisResult.module.css';

interface DiagnosisResultProps {
  diagnosis: DiagnosisResponse;
  files: File[];
}

const getConfidenceColor = (confidence: DiagnosisResponse['primaryConfidence'] | undefined) => {
  switch (confidence) {
    case 'High':
      return '#308300';
    case 'Medium':
      return '#ecb100ff';
    case 'Low':
      return '#b60012ff';
    default:
      return '#6c757d';
  }
};

export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis, files }) => {
  const [modalImage, setModalImage] = useState<{ src: string; alt: string; index: number } | null>(null);

  const handleImageClick = (file: File, index: number) => {
    setModalImage({
      src: URL.createObjectURL(file),
      alt: `Plant image ${index + 1}`,
      index: index
    });
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const handlePrevious = () => {
    if (modalImage && modalImage.index > 0) {
      const newIndex = modalImage.index - 1;
      const file = files[newIndex];
      setModalImage({
        src: URL.createObjectURL(file),
        alt: `Plant image ${newIndex + 1}`,
        index: newIndex
      });
    }
  };

  const handleNext = () => {
    if (modalImage && modalImage.index < files.length - 1) {
      const newIndex = modalImage.index + 1;
      const file = files[newIndex];
      setModalImage({
        src: URL.createObjectURL(file),
        alt: `Plant image ${newIndex + 1}`,
        index: newIndex
      });
    }
  };

  return (
    <div className={styles.resultContainer}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>Plant Identified: {diagnosis.plant}</h3>
      </div>
      
      {/* Image previews section */}
      {files.length > 0 && (
        <div className={styles.imagePreviewSection}>
          <div className={styles.smallPreviewContainer}>
            {files.map((file, index) => (
              <div key={index} className={styles.smallPreviewItem}>
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={`Plant image ${index + 1}`} 
                  className={styles.smallPreviewImage}
                  onClick={() => handleImageClick(file, index)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className={`${styles.header} ${styles.primaryDiagnosisHeader}`}>
        <h3 className={styles.headerTitle}>Primary Diagnosis: {diagnosis.primaryDiagnosis}</h3>
      </div>
      <div className={styles.header}>
        <span
          className={styles.confidence}
          style={{ backgroundColor: getConfidenceColor(diagnosis.primaryConfidence) }}
        >
          {diagnosis.primaryConfidence} Confidence
        </span>
      </div>

      {diagnosis.primarySummary && (
        <div className={`base-card-info ${styles.section} ${styles.summarySection}`}>
          <h3>Summary</h3>
          <ReactMarkdown>{diagnosis.primarySummary}</ReactMarkdown>
        </div>
      )}

      <div className={styles.section}>
        <h3>Reasoning</h3>
        <ReactMarkdown>{diagnosis.primaryReasoning}</ReactMarkdown>
      </div>

      <div className={styles.section}>
        <h3>Treatment Plan</h3>
        <ReactMarkdown>{diagnosis.primaryTreatmentPlan}</ReactMarkdown>
      </div>

      <div className={styles.section}>
        <h3>Prevention Tips</h3>
        <ReactMarkdown>{diagnosis.primaryPreventionTips}</ReactMarkdown>
      </div>

      {diagnosis.secondaryDiagnosis && diagnosis.secondaryDiagnosis.trim() && (
        <div className={`${styles.section} ${styles.secondaryDiagnosisSection}`}>
          <div className={styles.header}>
            <h3 className={styles.secondaryHeaderTitle}>Secondary Diagnosis: {diagnosis.secondaryDiagnosis}</h3>
          </div>
          <div className={styles.header}>
            {diagnosis.secondaryConfidence && (
              <span
                className={styles.confidence}
                style={{ backgroundColor: getConfidenceColor(diagnosis.secondaryConfidence) }}
              >
                {diagnosis.secondaryConfidence} Confidence
              </span>
            )}
          </div>
          {diagnosis.secondarySummary && (
            <div className={`base-card-info ${styles.subsection} ${styles.summarySection}`}>
              <h3>Summary</h3>
              <ReactMarkdown>{diagnosis.secondarySummary}</ReactMarkdown>
            </div>
          )}
          {diagnosis.secondaryReasoning && (
            <div className={styles.subsection}>
              <h3>Reasoning</h3>
              <ReactMarkdown>{diagnosis.secondaryReasoning}</ReactMarkdown>
            </div>
          )}
          {diagnosis.secondaryTreatmentPlan && (
            <div className={styles.subsection}>
              <h3>Treatment Plan</h3>
              <ReactMarkdown>{diagnosis.secondaryTreatmentPlan}</ReactMarkdown>
            </div>
          )}
          {diagnosis.secondaryPreventionTips && (
            <div className={styles.subsection}>
              <h3>Prevention Tips</h3>
              <ReactMarkdown>{diagnosis.secondaryPreventionTips}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={modalImage !== null}
        imageSrc={modalImage?.src || ''}
        imageAlt={modalImage?.alt || ''}
        onClose={closeModal}
        currentIndex={modalImage?.index}
        totalImages={files.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
};