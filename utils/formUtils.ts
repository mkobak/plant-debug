export const createFormData = (files: File[], formState: Record<string, any>): FormData => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('images', file);
  });
  
  Object.entries(formState).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else {
      formData.append(key, value);
    }
  });
  
  return formData;
};

export const validateFiles = (files: File[]): string | null => {
  if (files.length === 0) {
    return 'Please upload at least one image of your plant.';
  }
  return null;
};
