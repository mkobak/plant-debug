import React from 'react';
import { DiagnosisFormState } from '../types';
import styles from '../styles/ContextForm.module.css';

interface ContextFormProps {
  formState: DiagnosisFormState;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ContextForm: React.FC<ContextFormProps> = ({ formState, onFormChange }) => {
  return (
    <>
      <label htmlFor="plantType" style={{ fontWeight: 'bold' }}>
        Plant Type
        <span style={{ fontWeight: 'normal', color: '#888', fontSize: '0.95em', marginLeft: 4 }}>
          (e.g., Fiddle Leaf Fig)
        </span>
      </label>
      <input
        type="text"
        id="plantType"
        name="plantType"
        placeholder="Plant Type (e.g., Fiddle Leaf Fig)"
        value={formState.plantType}
        onChange={onFormChange}
        className={styles.input}
        aria-label="Plant Type"
      />

      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 'bold' }}>Location</legend>
        <span style={{ color: '#888', fontSize: '0.95em' }}>
          Is this an indoor or outdoor plant?
        </span>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: 8 }}>
          <label>
            <input
              type="radio"
              name="location"
              value="indoor"
              checked={formState.location === 'indoor'}
              onChange={onFormChange}
              aria-label="Indoor"
            />
            Indoor
          </label>
          <label>
            <input
              type="radio"
              name="location"
              value="outdoor"
              checked={formState.location === 'outdoor'}
              onChange={onFormChange}
              aria-label="Outdoor"
            />
            Outdoor
          </label>
        </div>
      </fieldset>

      <label htmlFor="watering" style={{ fontWeight: 'bold', marginTop: 12 }}>
        Watering
        <span style={{ fontWeight: 'normal', color: '#888', fontSize: '0.95em', marginLeft: 4 }}>
          How have you been watering it?
        </span>
      </label>
      <select
        id="watering"
        name="watering"
        value={formState.watering}
        onChange={onFormChange}
        className={styles.select}
        aria-label="Watering"
      >
        <option value="">Select Watering Schedule</option>
        <option value="consistently">Consistently</option>
        <option value="infrequently">Infrequently</option>
        <option value="more_than_usual">More than usual</option>
      </select>

      <label htmlFor="sunlight" style={{ fontWeight: 'bold', marginTop: 12 }}>
        Sunlight
        <span style={{ fontWeight: 'normal', color: '#888', fontSize: '0.95em', marginLeft: 4 }}>
          How much light does it get?
        </span>
      </label>
      <select
        id="sunlight"
        name="sunlight"
        value={formState.sunlight}
        onChange={onFormChange}
        className={styles.select}
        aria-label="Sunlight"
      >
        <option value="">Select Sunlight Exposure</option>
        <option value="low">Low Light</option>
        <option value="indirect">Bright indirect light</option>
        <option value="full">Full sun</option>
      </select>
    </>
  );
};

export default ContextForm;