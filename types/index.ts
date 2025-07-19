export interface DiagnosisFormState {
  plantType: string;
  location: 'indoor' | 'outdoor' | 'greenhouse' | 'windowsill' | 'balcony' | '';
  wateringFrequency: string;
  wateringAmount: string;
  wateringMethod: string;
  sunlight: 'low' | 'indirect' | 'full' | '';
  sunlightHours: string;
  soilType: string;
  fertilizer: string;
  humidity: string;
  temperature: string;
  pests: string;
  symptoms: string[];
  potDetails: string;
  recentChanges: string;
  plantAge: string;
  description: string;
}

export interface DiagnosisResponse {
  plant: string;
  primaryDiagnosis: string;
  primaryConfidence: 'High' | 'Medium' | 'Low';
  primaryReasoning: string;
  primaryTreatmentPlan: string;
  primaryPreventionTips: string;
  secondaryDiagnosis?: string;
  secondaryConfidence?: 'High' | 'Medium' | 'Low';
  secondaryReasoning?: string;
  secondaryTreatmentPlan?: string;
  secondaryPreventionTips?: string;
}