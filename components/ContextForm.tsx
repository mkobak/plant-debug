

import React, { useState } from 'react';
import { DiagnosisFormState } from '../types';
import styles from '../styles/ContextForm.module.css';
import { WATERING_FREQUENCY_LABELS, WATERING_AMOUNT_LABELS, SUNLIGHT_LABELS } from '../utils/constants';

interface ContextFormProps {
  formState: DiagnosisFormState;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  plantNameLoading?: boolean;
  plantNameDisabled?: boolean;
}

// Main fields always shown
const MAIN_FIELDS = ['plantType', 'description', 'pests', 'watering', 'sunlight'];

const ContextForm: React.FC<ContextFormProps> = ({ formState, onFormChange, plantNameLoading, plantNameDisabled }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Helper function to handle slider changes
  const handleSliderChange = (fieldName: string, value: string) => {
    onFormChange({
      target: { name: fieldName, value: value }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Helper function to reset a slider
  const resetSlider = (fieldName: string) => {
    onFormChange({
      target: { name: fieldName, value: '' }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Helper function to reset watering sliders
  const resetWateringSliders = () => {
    onFormChange({
      target: { name: 'wateringFrequency', value: '' }
    } as React.ChangeEvent<HTMLInputElement>);
    onFormChange({
      target: { name: 'wateringAmount', value: '' }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Helper function to reset light slider
  const resetLightSlider = () => {
    onFormChange({
      target: { name: 'sunlight', value: '' }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Helper function to reset a radio button
  const resetRadio = (fieldName: string) => {
    onFormChange({
      target: { name: fieldName, value: '' }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Helper function to get slider display value
  const getSliderDisplayValue = (fieldName: string, valueMap: string[]) => {
    const value = formState[fieldName as keyof DiagnosisFormState] as string;
    if (!value) return '';
    const idx = parseInt(value) - 1;
    return valueMap[idx] || '';
  };
  return (
    <>
      {/* Plant name */}
      <label htmlFor="plantType" className={styles.labelWithIcon}>
        Plant name
        {plantNameLoading && (
          <span className={`${styles.spinner} ${styles.smallSpinner}`} />
        )}
      </label>
      <input
        type="text"
        id="plantType"
        name="plantType"
        placeholder=""
        value={formState.plantType}
        onChange={onFormChange}
        className={`base-input ${styles.input} ${plantNameLoading ? styles.inputDisabled : ''}`}
        aria-label="Plant Type"
        disabled={plantNameLoading || plantNameDisabled}
      />

      {/* Description */}
      <label htmlFor="description" className={styles.label}>
        Describe the problem
      </label>
      <textarea
        id="description"
        name="description"
        placeholder="e.g., Leaves are turning yellow and have brown spots."
        value={formState.description}
        onChange={onFormChange}
        className={`base-input ${styles.input} ${styles.textarea}`}
        aria-label="Description"
        rows={2}
      />

      {/* Pests */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Any bugs crawling around?</label>
        <div className={styles.radioGroupWithReset}>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="pests"
                value="yes"
                checked={formState.pests === 'yes'}
                onChange={onFormChange}
                className={styles.radioInput}
              />
              Yes
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="pests"
                value="no"
                checked={formState.pests === 'no'}
                onChange={onFormChange}
                className={styles.radioInput}
              />
              No
            </label>
          </div>
          {formState.pests && (
            <span 
              className="slider-reset-btn"
              onClick={() => resetRadio('pests')}
              title="Reset"
            >
            </span>
          )}
        </div>
      </div>

      {/* Watering (frequency and amount sliders) */}
      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabelWithReset}>
          <label className={styles.fieldLabel}>Watering habits</label>
          {(formState.wateringFrequency || formState.wateringAmount) && (
            <span 
              className="slider-reset-btn slider-reset-section"
              onClick={resetWateringSliders}
              title="Reset watering settings"
            >
            </span>
          )}
        </div>
        <div className={styles.sliderGroup}>
          <div className={styles.sliderRow}>
            <span className="slider-label">Frequency</span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              name="wateringFrequency"
              value={formState.wateringFrequency ?? ''}
              onChange={e => handleSliderChange('wateringFrequency', e.target.value)}
              className={formState.wateringFrequency ? 'active' : ''}
            />
            <div className="slider-value-box" title={getSliderDisplayValue('wateringFrequency', WATERING_FREQUENCY_LABELS)}>
              <span className="slider-value-text">
                {getSliderDisplayValue('wateringFrequency', WATERING_FREQUENCY_LABELS)}
              </span>
            </div>
          </div>
          <div className={styles.sliderRow}>
            <span className="slider-label">Amount</span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              name="wateringAmount"
              value={formState.wateringAmount ?? ''}
              onChange={e => handleSliderChange('wateringAmount', e.target.value)}
              className={formState.wateringAmount ? 'active' : ''}
            />
            <div className="slider-value-box" title={getSliderDisplayValue('wateringAmount', WATERING_AMOUNT_LABELS)}>
              <span className="slider-value-text">
                {getSliderDisplayValue('wateringAmount', WATERING_AMOUNT_LABELS)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Light slider */}
      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabelWithReset}>
          <label className={styles.fieldLabel}>Light situation</label>
          {formState.sunlight && (
            <span 
              className="slider-reset-btn slider-reset-section"
              onClick={resetLightSlider}
              title="Reset light settings"
            >
            </span>
          )}
        </div>
        <div className={styles.sliderRow}>
          <span className="slider-label">Amount</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            name="sunlight"
            value={formState.sunlight ?? ''}
            onChange={e => handleSliderChange('sunlight', e.target.value)}
            className={formState.sunlight ? 'active' : ''}
          />
          <div className="slider-value-box" title={getSliderDisplayValue('sunlight', SUNLIGHT_LABELS)}>
            <span className="slider-value-text">
              {getSliderDisplayValue('sunlight', SUNLIGHT_LABELS)}
            </span>
          </div>
        </div>
      </div>

      {/* Details/extra fields button and section */}
      <details className={styles.detailsContainer} open={detailsOpen} onToggle={e => setDetailsOpen(e.currentTarget.open)}>
        <summary className={styles.detailsSummary}>
          Provide more information
        </summary>
        {detailsOpen && (
          <div className={styles.detailsContent}>
            <label htmlFor="soilType" className={styles.detailLabel}>Soil type</label>
            <input
              type="text"
              id="soilType"
              name="soilType"
              placeholder="e.g., potting mix, cactus mix, hydroponic, etc."
              value={formState.soilType}
              onChange={onFormChange}
              className="base-input"
            />

            <label htmlFor="potDetails" className={styles.detailLabel}>Pot details</label>
            <input
              type="text"
              id="potDetails"
              name="potDetails"
              placeholder="Size, drainage, repotting history"
              value={formState.potDetails}
              onChange={onFormChange}
              className="base-input"
            />

            <label htmlFor="fertilizer" className={styles.detailLabel}>Fertilizer use</label>
            <input
              type="text"
              id="fertilizer"
              name="fertilizer"
              placeholder="Type, frequency, last applied"
              value={formState.fertilizer}
              onChange={onFormChange}
              className="base-input"
            />

            <label htmlFor="humidity" className={styles.detailLabel}>Humidity</label>
            <input
              type="text"
              id="humidity"
              name="humidity"
              placeholder="e.g., 40%, low, medium, high"
              value={formState.humidity}
              onChange={onFormChange}
              className="base-input"
            />

            <label htmlFor="temperature" className={styles.detailLabel}>Temperature range</label>
            <input
              type="text"
              id="temperature"
              name="temperature"
              placeholder="e.g., 18-24°C"
              value={formState.temperature}
              onChange={onFormChange}
              className="base-input"
            />

            <label htmlFor="symptoms" className={styles.detailLabel}>Symptoms (select all that apply)</label>
            <div className={styles.checkboxGroup}>
              {['Yellowing leaves', 'Wilting', 'Brown spots', 'Mold/fungus', 'Leaf drop', 'Curling leaves', 'Sticky residue', 'Holes/chewed leaves'].map((symptom) => (
                <label key={symptom} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="symptoms"
                    value={symptom}
                    checked={formState.symptoms?.includes(symptom)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const value = e.target.value;
                      let updated = formState.symptoms || [];
                      if (checked) {
                        updated = [...updated, value];
                      } else {
                        updated = updated.filter((s) => s !== value);
                      }
                      onFormChange({
                        ...e,
                        target: { ...e.target, name: 'symptoms', value: updated }
                      } as any);
                    }}
                  />
                  {symptom}
                </label>
              ))}
            </div>

            <label htmlFor="recentChanges" className={styles.detailLabel}>Recent changes</label>
            <input
              type="text"
              id="recentChanges"
              name="recentChanges"
              placeholder="Recent changes in care, location, etc."
              value={formState.recentChanges}
              onChange={onFormChange}
              className="base-input"
            />

            <label htmlFor="plantAge" className={styles.detailLabel}>Plant age</label>
            <input
              type="text"
              id="plantAge"
              name="plantAge"
              placeholder="Approximate age of the plant"
              value={formState.plantAge}
              onChange={onFormChange}
              className="base-input"
            />
          </div>
        )}
      </details>
    </>
  );
};

export default ContextForm;