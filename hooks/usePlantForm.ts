import { useState } from 'react';
import { DiagnosisFormState, DiagnosisResponse, IntermediateDiagnosisResponse } from '../types';
import { WATERING_FREQUENCY_LABELS, WATERING_AMOUNT_LABELS, SUNLIGHT_LABELS } from '../constants/sliderLabels';

const initialFormState: DiagnosisFormState = {
  plantType: '',
  location: '',
  wateringFrequency: '',
  wateringAmount: '',
  wateringMethod: '',
  sunlight: '',
  sunlightHours: '',
  soilType: '',
  fertilizer: '',
  humidity: '',
  temperature: '',
  pests: '',
  symptoms: [],
  potDetails: '',
  recentChanges: '',
  plantAge: '',
  description: '',
};

export const usePlantForm = () => {
  const [formState, setFormState] = useState<DiagnosisFormState>(initialFormState);
  const [files, setFiles] = useState<File[]>([]);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [intermediateDiagnosis, setIntermediateDiagnosis] = useState<IntermediateDiagnosisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plantNameLoading, setPlantNameLoading] = useState(false);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const resetForm = () => {
    setFiles([]);
    setFormState(initialFormState);
    setDiagnosis(null);
    setIntermediateDiagnosis(null);
    setError(null);
  };

  const mapFormStateForAPI = () => {
    return {
      ...formState,
      wateringFrequency: formState.wateringFrequency
        ? WATERING_FREQUENCY_LABELS[parseInt(formState.wateringFrequency) - 1] || ''
        : '',
      wateringAmount: formState.wateringAmount
        ? WATERING_AMOUNT_LABELS[parseInt(formState.wateringAmount) - 1] || ''
        : '',
      sunlight: formState.sunlight
        ? SUNLIGHT_LABELS[parseInt(formState.sunlight) - 1] || ''
        : '',
    };
  };

  const identifyPlantName = async () => {
    if (files.length === 0) return;
    
    setPlantNameLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      const response = await fetch('/api/v1/identify-plant', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Could not identify plant name');
      }
      
      const data = await response.json();
      setFormState((prev) => ({ ...prev, plantType: data.plantName || '' }));
    } catch (err: any) {
      setError('Could not identify plant name');
    } finally {
      setPlantNameLoading(false);
    }
  };

  const submitDiagnosis = async () => {
    if (files.length === 0) {
      setError('Please upload at least one image of your plant.');
      return false;
    }

    setIsLoading(true);
    setError(null);
    setDiagnosis(null);
    setIntermediateDiagnosis(null);

    const mappedFormState = mapFormStateForAPI();
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    Object.entries(mappedFormState).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else {
        formData.append(key, value);
      }
    });

    try {
      // Step 1: Get intermediate diagnoses
      const intermediateResponse = await fetch('/api/v1/diagnose-intermediate', {
        method: 'POST',
        body: formData,
      });

      if (!intermediateResponse.ok) {
        const errorData = await intermediateResponse.json();
        throw new Error(errorData.error || 'An unknown error occurred during initial analysis.');
      }

      const intermediateResult = await intermediateResponse.json();
      console.log("Intermediate diagnosis result:", intermediateResult);
      setIntermediateDiagnosis(intermediateResult);

      // Step 2: Get final diagnosis with ranked diagnoses
      const finalFormData = new FormData();
      files.forEach((file) => {
        finalFormData.append('images', file);
      });
      
      Object.entries(mappedFormState).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => finalFormData.append(key, v));
        } else {
          finalFormData.append(key, value);
        }
      });

      // Add the ranked diagnoses from the intermediate step
      finalFormData.append('rankedDiagnoses', intermediateResult.rankedDiagnoses.join(', '));
      console.log("Sending ranked diagnoses to final API:", intermediateResult.rankedDiagnoses.join(', '));

      const response = await fetch('/api/v1/diagnose', {
        method: 'POST',
        body: finalFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred.');
      }

      const result = await response.json();
      setDiagnosis(result);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formState,
    setFormState,
    files,
    setFiles,
    diagnosis,
    intermediateDiagnosis,
    isLoading,
    error,
    plantNameLoading,
    handleFormChange,
    resetForm,
    identifyPlantName,
    submitDiagnosis,
  };
};
