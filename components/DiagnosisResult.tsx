import React from 'react';
import ReactMarkdown from 'react-markdown';
import { DiagnosisResponse } from '../types';
import styles from '../styles/DiagnosisResult.module.css';

interface DiagnosisResultProps {
  diagnosis: DiagnosisResponse;
}

const getConfidenceColor = (confidence: DiagnosisResponse['confidence']) => {
  switch (confidence) {
    case 'High':
      return '#28a745';
    case 'Medium':
      return '#ffc107';
    case 'Low':
      return '#dc3545';
    default:
      return '#6c757d';
  }
};

export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis }) => {
  return (
    <div className={styles.resultContainer}>
      <div className={styles.header}>
        <h2>Diagnosis: {diagnosis.diagnosis}</h2>
        <span
          className={styles.confidence}
          style={{ backgroundColor: getConfidenceColor(diagnosis.confidence) }}
        >
          {diagnosis.confidence} Confidence
        </span>
      </div>

      <div className={styles.section}>
        <h3>Reasoning</h3>
        <ReactMarkdown>{diagnosis.reasoning}</ReactMarkdown>
      </div>

      <div className={styles.section}>
        <h3>Treatment Plan</h3>
        <ReactMarkdown>{diagnosis.treatmentPlan}</ReactMarkdown>
      </div>

      <div className={styles.section}>
        <h3>Prevention Tips</h3>
        <ReactMarkdown>{diagnosis.preventionTips}</ReactMarkdown>
      </div>
    </div>
  );
};