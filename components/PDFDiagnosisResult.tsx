import React from 'react';
import { DiagnosisResponse } from '../types';

interface PDFDiagnosisResultProps {
  diagnosis: DiagnosisResponse;
  files: File[];
}

const getConfidenceColor = (confidence: DiagnosisResponse['primaryConfidence'] | undefined) => {
  switch (confidence) {
    case 'High':
      return '#308300';
    case 'Medium':
      return '#ecb100';
    case 'Low':
      return '#b60012';
    default:
      return '#6c757d';
  }
};

// Simple markdown to React elements conversion
const MarkdownToReact: React.FC<{ children: string }> = ({ children }) => {
  const convertMarkdown = (text: string) => {
    // Split by lines to handle lists properly
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (currentList.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        elements.push(
          <ListTag key={`list-${elements.length}`} style={{ margin: '10px 0', paddingLeft: '25px' }}>
            {currentList.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '5px' }}>
                {convertInlineMarkdown(item)}
              </li>
            ))}
          </ListTag>
        );
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle bullet points
      if (trimmedLine.match(/^[-*+]\s+/)) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(trimmedLine.replace(/^[-*+]\s+/, ''));
      }
      // Handle numbered lists
      else if (trimmedLine.match(/^\d+\.\s+/)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(trimmedLine.replace(/^\d+\.\s+/, ''));
      }
      // Regular paragraph
      else if (trimmedLine) {
        flushList();
        elements.push(
          <p key={`p-${index}`} style={{ margin: '10px 0', lineHeight: '1.6' }}>
            {convertInlineMarkdown(trimmedLine)}
          </p>
        );
      }
    });

    flushList(); // Flush any remaining list
    return elements;
  };

  const convertInlineMarkdown = (text: string) => {
    // Convert **bold** text
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return <div>{convertMarkdown(children)}</div>;
};

export const PDFDiagnosisResult: React.FC<PDFDiagnosisResultProps> = ({ diagnosis, files }) => {
  const containerStyle: React.CSSProperties = {
    width: '800px',
    padding: '40px',
    backgroundColor: 'white',
    fontFamily: '"Helvetica", "Arial", sans-serif',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#333'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    margin: '0 0 30px 0',
    color: '#2d5016',
    borderBottom: '3px solid #2d5016',
    paddingBottom: '15px',
    textAlign: 'center'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '20px',
    margin: '0 0 20px 0',
    color: '#2d5016'
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '25px'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    margin: '0 0 15px 0',
    color: '#333',
    borderBottom: '1px solid #ddd',
    paddingBottom: '8px'
  };

  const summaryStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    borderLeft: '4px solid #2d5016',
    marginBottom: '25px'
  };

  const secondarySummaryStyle: React.CSSProperties = {
    ...summaryStyle,
    borderLeft: '4px solid #666'
  };

  const confidenceStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '20px'
  };

  const secondaryStyle: React.CSSProperties = {
    marginTop: '40px',
    paddingTop: '30px',
    borderTop: '2px solid #ddd'
  };

  const imageContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    marginBottom: '30px'
  };

  const imageStyle: React.CSSProperties = {
    width: '150px',
    height: '150px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    objectFit: 'cover'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <h1 style={titleStyle}>Plant Diagnosis Report</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '14px' }}>
        Generated on {new Date().toLocaleDateString()}
      </p>
      
      <h2 style={subtitleStyle}>Plant Identified: {diagnosis.plant}</h2>

      {/* Images */}
      {files.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Plant Images:</h3>
          <div style={imageContainerStyle}>
            {files.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Plant image ${index + 1}`}
                style={imageStyle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Primary Diagnosis */}
      <h2 style={subtitleStyle}>Primary Diagnosis: {diagnosis.primaryDiagnosis}</h2>
      <span 
        style={{
          ...confidenceStyle,
          backgroundColor: getConfidenceColor(diagnosis.primaryConfidence)
        }}
      >
        {diagnosis.primaryConfidence} Confidence
      </span>

      {/* Primary Summary */}
      {diagnosis.primarySummary && (
        <div style={summaryStyle}>
          <h3 style={{ fontSize: '18px', margin: '0 0 15px 0', color: '#2d5016' }}>Summary</h3>
          <MarkdownToReact>{diagnosis.primarySummary}</MarkdownToReact>
        </div>
      )}

      {/* Primary Sections */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Reasoning</h3>
        <MarkdownToReact>{diagnosis.primaryReasoning}</MarkdownToReact>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Treatment Plan</h3>
        <MarkdownToReact>{diagnosis.primaryTreatmentPlan}</MarkdownToReact>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Prevention Tips</h3>
        <MarkdownToReact>{diagnosis.primaryPreventionTips}</MarkdownToReact>
      </div>

      {/* Secondary Diagnosis */}
      {diagnosis.secondaryDiagnosis && diagnosis.secondaryDiagnosis.trim() && (
        <div style={secondaryStyle}>
          <h2 style={{ ...subtitleStyle, color: '#666' }}>
            Secondary Diagnosis: {diagnosis.secondaryDiagnosis}
          </h2>
          {diagnosis.secondaryConfidence && (
            <span 
              style={{
                ...confidenceStyle,
                backgroundColor: getConfidenceColor(diagnosis.secondaryConfidence)
              }}
            >
              {diagnosis.secondaryConfidence} Confidence
            </span>
          )}

          {diagnosis.secondarySummary && (
            <div style={secondarySummaryStyle}>
              <h3 style={{ fontSize: '18px', margin: '0 0 15px 0', color: '#666' }}>Summary</h3>
              <MarkdownToReact>{diagnosis.secondarySummary}</MarkdownToReact>
            </div>
          )}

          {diagnosis.secondaryReasoning && (
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Reasoning</h3>
              <MarkdownToReact>{diagnosis.secondaryReasoning}</MarkdownToReact>
            </div>
          )}

          {diagnosis.secondaryTreatmentPlan && (
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Treatment Plan</h3>
              <MarkdownToReact>{diagnosis.secondaryTreatmentPlan}</MarkdownToReact>
            </div>
          )}

          {diagnosis.secondaryPreventionTips && (
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Prevention Tips</h3>
              <MarkdownToReact>{diagnosis.secondaryPreventionTips}</MarkdownToReact>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
