import React from 'react';
import ReactMarkdown from 'react-markdown';
import { DiagnosisResponse } from '../types';
import styles from '../styles/DiagnosisResult.module.css';

interface DiagnosisResultProps {
  diagnosis: DiagnosisResponse;
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

export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis }) => {
  return (
    <div className={styles.resultContainer}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>Plant Identified: {diagnosis.plant}</h3>
      </div>
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
    </div>
  );
};