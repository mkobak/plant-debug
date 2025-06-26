export interface DiagnosisFormState {
  plantType: string;
  location: 'indoor' | 'outdoor' | '';
  watering: 'consistently' | 'infrequently' | 'more_than_usual' | '';
  sunlight: 'low' | 'indirect' | 'full' | '';
}

export interface DiagnosisResponse {
  diagnosis: string;
  confidence: 'High' | 'Medium' | 'Low';
  reasoning: string;
  treatmentPlan: string;
  preventionTips: string;
}