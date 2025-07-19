
import React from 'react';
import { DiagnosisFormState } from '../types';
import styles from '../styles/ContextForm.module.css';

interface ContextFormProps {
  formState: DiagnosisFormState;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const ContextForm: React.FC<ContextFormProps> = ({ formState, onFormChange }) => {
  return (
    <>
      <label htmlFor="plantType" style={{ fontWeight: 'bold' }}>
        Plant name
      </label>
      <input
        type="text"
        id="plantType"
        name="plantType"
        placeholder="e.g., Monstera"
        value={formState.plantType}
        onChange={onFormChange}
        className={styles.input}
        aria-label="Plant Type"
      />
      <label htmlFor="description" style={{ fontWeight: 'bold', marginTop: 12 }}>
        Describe the problem
      </label>
      <textarea
        id="description"
        name="description"
        placeholder="e.g., Leaves are turning yellow and have brown spots."
        value={formState.description}
        onChange={onFormChange}
        className={styles.input}
        aria-label="Description"
        rows={3}
        style={{ resize: 'vertical', marginBottom: 12 }}
      />
      <label htmlFor="location" style={{ fontWeight: 'bold', marginTop: 12 }}>Location</label>
      <select
        id="location"
        name="location"
        value={formState.location}
        onChange={onFormChange}
        className={styles.select}
        aria-label="Location"
      >
        <option value="">Select Location</option>
        <option value="indoor">Indoor</option>
        <option value="outdoor">Outdoor</option>
        <option value="greenhouse">Greenhouse</option>
        <option value="windowsill">Windowsill</option>
        <option value="balcony">Balcony</option>
      </select>

      <label style={{ fontWeight: 'bold', marginTop: 12 }}>Watering</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <select
          id="wateringFrequency"
          name="wateringFrequency"
          value={formState.wateringFrequency}
          onChange={onFormChange}
          className={styles.select}
          aria-label="Watering Frequency"
        >
          <option value="">Frequency</option>
          <option value="daily">Daily</option>
          <option value="every_2_3_days">Every 2-3 days</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Every 2 weeks</option>
          <option value="monthly">Monthly</option>
        </select>
        <select
          id="wateringAmount"
          name="wateringAmount"
          value={formState.wateringAmount}
          onChange={onFormChange}
          className={styles.select}
          aria-label="Watering Amount"
        >
          <option value="">Amount</option>
          <option value="light">Light</option>
          <option value="moderate">Moderate</option>
          <option value="heavy">Heavy</option>
        </select>
        <select
          id="wateringMethod"
          name="wateringMethod"
          value={formState.wateringMethod}
          onChange={onFormChange}
          className={styles.select}
          aria-label="Watering Method"
        >
          <option value="">Method</option>
          <option value="top">Top watering</option>
          <option value="bottom">Bottom watering</option>
          <option value="misting">Misting</option>
        </select>
      </div>

      <label style={{ fontWeight: 'bold', marginTop: 12 }}>Sunlight</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <select
          id="sunlight"
          name="sunlight"
          value={formState.sunlight}
          onChange={onFormChange}
          className={styles.select}
          aria-label="Sunlight"
        >
          <option value="">Exposure</option>
          <option value="very_low">Very Low (no direct light)</option>
          <option value="low">Low (little natural light)</option>
          <option value="medium">Medium (some morning/evening sun)</option>
          <option value="bright_indirect">Bright Indirect (filtered light)</option>
          <option value="partial_sun">Partial Sun (direct sun for part of the day)</option>
          <option value="full">Full Sun (direct sun most of the day)</option>
        </select>
        <input
          type="text"
          id="sunlightHours"
          name="sunlightHours"
          placeholder="Hours/day (e.g. 4)"
          value={formState.sunlightHours}
          onChange={onFormChange}
          className={styles.input}
          style={{ maxWidth: 120 }}
        />
      </div>

      <label htmlFor="soilType" style={{ fontWeight: 'bold', marginTop: 12 }}>Soil/Medium</label>
      <input
        type="text"
        id="soilType"
        name="soilType"
        placeholder="e.g., potting mix, cactus mix, hydroponic, etc."
        value={formState.soilType}
        onChange={onFormChange}
        className={styles.input}
      />

      <label htmlFor="fertilizer" style={{ fontWeight: 'bold', marginTop: 12 }}>Fertilizer Use</label>
      <input
        type="text"
        id="fertilizer"
        name="fertilizer"
        placeholder="Type, frequency, last applied"
        value={formState.fertilizer}
        onChange={onFormChange}
        className={styles.input}
      />

      <label htmlFor="humidity" style={{ fontWeight: 'bold', marginTop: 12 }}>Humidity</label>
      <input
        type="text"
        id="humidity"
        name="humidity"
        placeholder="e.g., 40%, low, medium, high"
        value={formState.humidity}
        onChange={onFormChange}
        className={styles.input}
      />

      <label htmlFor="temperature" style={{ fontWeight: 'bold', marginTop: 12 }}>Temperature Range</label>
      <input
        type="text"
        id="temperature"
        name="temperature"
        placeholder="e.g., 18-24°C, day/night"
        value={formState.temperature}
        onChange={onFormChange}
        className={styles.input}
      />

      <label htmlFor="pests" style={{ fontWeight: 'bold', marginTop: 12 }}>Pest Sightings</label>
      <input
        type="text"
        id="pests"
        name="pests"
        placeholder="e.g., spider mites, aphids, none, not sure"
        value={formState.pests}
        onChange={onFormChange}
        className={styles.input}
      />

      <label htmlFor="symptoms" style={{ fontWeight: 'bold', marginTop: 12 }}>Symptoms (select all that apply)</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {['Yellowing leaves', 'Wilting', 'Brown spots', 'Mold/fungus', 'Leaf drop', 'Curling leaves', 'Sticky residue', 'Holes/chewed leaves'].map((symptom) => (
          <label key={symptom} style={{ fontWeight: 'normal' }}>
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

      <label htmlFor="potDetails" style={{ fontWeight: 'bold', marginTop: 12 }}>Pot/Container Details</label>
      <input
        type="text"
        id="potDetails"
        name="potDetails"
        placeholder="Pot size, drainage, repotting history"
        value={formState.potDetails}
        onChange={onFormChange}
        className={styles.input}
      />

      <label htmlFor="recentChanges" style={{ fontWeight: 'bold', marginTop: 12 }}>Recent Changes</label>
      <input
        type="text"
        id="recentChanges"
        name="recentChanges"
        placeholder="Any recent changes in care, location, etc."
        value={formState.recentChanges}
        onChange={onFormChange}
        className={styles.input}
      />



      <label htmlFor="plantAge" style={{ fontWeight: 'bold', marginTop: 12 }}>Plant Age</label>
      <input
        type="text"
        id="plantAge"
        name="plantAge"
        placeholder="Approximate age of the plant"
        value={formState.plantAge}
        onChange={onFormChange}
        className={styles.input}
      />
    </>
  );
};

export default ContextForm;