import { GoogleGenerativeAI } from '@google/generative-ai';
import { File } from 'formidable';
import fs from 'fs/promises';
import sharp from 'sharp';

// Helper to convert buffer to a Gemini-compatible format
export const bufferToGenerativePart = (buffer: Buffer, file: File) => {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: file.mimetype || 'application/octet-stream',
    },
  };
};

// Initialize Gemini AI and return models
export const initializeGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing.');
  }

  let genAI;
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  } catch (err) {
    throw new Error('Failed to initialize Gemini API. Check your API key.');
  }

  return {
    modelPro: genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }), // Using Flash as Pro for now
    modelFlash: genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }),
    modelFlashLite: genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite-preview-06-17' }),
  };
};

// Process and resize images
export const processImages = async (imageFiles: File[]) => {
  const imageParts = [];
  
  for (const file of imageFiles) {
    if (!file || !file.filepath) continue;
    
    try {
      const imageBuffer = await fs.readFile(file.filepath);
      const resizedBuffer = await sharp(imageBuffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      imageParts.push(bufferToGenerativePart(resizedBuffer, file));
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Error processing one or more images. Please check the file format and try again.');
    }
  }
  
  return imageParts;
};

// Build context lines from form fields
export const buildContextLines = (fields: any) => {
  const contextLines: string[] = [];

   if (fields.plantType?.[0]) contextLines.push(`Plant: ${fields.plantType[0]}`);
  if (fields.description?.[0]) contextLines.push(`Problem description: ${fields.description[0]}`);
  if (fields.pests?.[0]) contextLines.push(`Pests visible: ${fields.pests[0]}`);
  if (fields.wateringFrequency?.[0] || fields.wateringAmount?.[0]) {
    const wateringParts = [];
    if (fields.wateringFrequency?.[0]) wateringParts.push(`frequency: ${fields.wateringFrequency[0]}`);
    if (fields.wateringAmount?.[0]) wateringParts.push(`amount: ${fields.wateringAmount[0]}`);
    contextLines.push(`Watering (${wateringParts.join(', ')})`);
  }
  if (fields.sunlight?.[0]) contextLines.push(`Light conditions: ${fields.sunlight[0]}`);
  if (fields.soilType?.[0]) contextLines.push(`- Soil/Medium: ${fields.soilType[0]}`);
  if (fields.fertilizer?.[0]) contextLines.push(`- Fertilizer: ${fields.fertilizer[0]}`);
  if (fields.humidity?.[0]) contextLines.push(`- Humidity: ${fields.humidity[0]}`);
  if (fields.temperature?.[0]) contextLines.push(`- Temperature: ${fields.temperature[0]}`);
  if (fields.symptoms && Array.isArray(fields.symptoms) && fields.symptoms.length > 0) {
    contextLines.push(`- Symptoms: ${fields.symptoms.join(', ')}`);
  }
  if (fields.potDetails?.[0]) contextLines.push(`- Pot/Container Details: ${fields.potDetails[0]}`);
  if (fields.recentChanges?.[0]) contextLines.push(`- Recent Changes: ${fields.recentChanges[0]}`);
  if (fields.plantAge?.[0]) contextLines.push(`- Plant Age: ${fields.plantAge[0]}`);
  
  return contextLines;
};

// Build simplified context lines for intermediate diagnosis
export const buildSimpleContextLines = (fields: any) => {
  const contextLines: string[] = [];
  
  if (fields.plantType?.[0]) contextLines.push(`Plant: ${fields.plantType[0]}`);
  if (fields.description?.[0]) contextLines.push(`Problem description: ${fields.description[0]}`);
  if (fields.pests?.[0]) contextLines.push(`Pests visible: ${fields.pests[0]}`);
  
  // Add watering info
  if (fields.wateringFrequency?.[0] || fields.wateringAmount?.[0]) {
    const wateringParts = [];
    if (fields.wateringFrequency?.[0]) wateringParts.push(`frequency: ${fields.wateringFrequency[0]}`);
    if (fields.wateringAmount?.[0]) wateringParts.push(`amount: ${fields.wateringAmount[0]}`);
    contextLines.push(`Watering (${wateringParts.join(', ')})`);
  }
  
  if (fields.sunlight?.[0]) contextLines.push(`Light conditions: ${fields.sunlight[0]}`);
  
  return contextLines;
};

// Get initial diagnosis from Gemini
export const getInitialDiagnosis = async (
  model: any,
  imageParts: any[],
  contextLines: string[],
  callNumber: number = 0
) => {
  const diagnosisPrompt = `
    You are an expert botanist. Based on the images and context, what are the most likely possible diagnoses for the plant's issue? Provide up to three diagnoses if multiple options seem likely.
    Only reply with the concrete diagnosis names, separated by commas, and nothing else. If no plant appears in the images, respond with 'No plant detected'. If the plant is healthy, respond with 'Plant is healthy'.
    User provided context: \n\n${contextLines.length ? contextLines.join('\n') : 'No further information was provided.'}
  `;

  console.log(`Gemini Flash call #${callNumber + 1} - Diagnosis prompt:`, diagnosisPrompt);
  
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: diagnosisPrompt }, ...imageParts] }],
    generationConfig: { temperature: 0.2, topP: 0.5 }
  });
  
  const response = await result.response;
  let diagnosis = "";
  try {
    diagnosis = response.text().trim();
  } catch {
    diagnosis = "";
  }
  
  console.log(`Gemini Flash call #${callNumber + 1} - Response:`, diagnosis);
  return diagnosis;
};

// Rank diagnoses by frequency
export const rankDiagnoses = async (model: any, diagnosisResults: string[]) => {
  console.log("All diagnosis results from 3 Flash calls:", diagnosisResults);
  
  // Parse all diagnoses into individual items
  const allDiagnoses = diagnosisResults
    .flatMap(result => result.split(','))
    .map(d => d.trim())
    .filter(d => d.length > 0 && d !== 'No plant detected' && d !== 'Plant is healthy');
  
  console.log("Parsed individual diagnoses:", allDiagnoses);
  
  const rankingPrompt = `
    You are an expert plant pathologist. I have collected these plant diagnosis suggestions from multiple experts:
    ${allDiagnoses.join(', ')}
    
    Please group similar diagnoses together and rank them by frequency/consensus. 
    Output ONLY a ranked list of the most likely diagnoses, most frequent first, comma-separated.
    Remove duplicates and group similar conditions together.
    Limit to maximum 5 diagnoses.
    
    Example output: "Root rot, Spider mites, Nitrogen deficiency"
  `;
  
  console.log("Gemini Flash Lite ranking prompt:", rankingPrompt);
  
  const rankingResult = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: rankingPrompt }] }],
    generationConfig: { temperature: 0.1, topP: 0.5 }
  });
  
  const rankingResponse = await rankingResult.response;
  let rankedDiagnoses = "";
  try {
    rankedDiagnoses = rankingResponse.text().trim();
  } catch {
    rankedDiagnoses = "";
  }
  
  console.log("Gemini Flash Lite ranking response:", rankedDiagnoses);
  return rankedDiagnoses;
};

// Define the function tool for structured output
export const getDiagnosisTools = () => {
  return [
    {
      function_declarations: [
        {
          name: "plant_diagnosis",
          description: "Diagnose plant issues and provide brief explanations, treatment and prevention tips.",
          parameters: {
            type: "object",
            properties: {
              plant: { 
                type: "string", 
                description: "Name of the plant in the pictures, both the common name and scientific name. If the user provided the name of the plant, verify it is correct. If it's not, provide the name of the plant that you identify from the pictures. Only provide the name of the plant and nothing else." 
              },
              primaryDiagnosis: { 
                type: "string", 
                description: "Most likely (primary) diagnosis based on the pictures and context." 
              },
              primaryConfidence: { 
                type: "string", 
                enum: ["High", "Medium", "Low"], 
                description: "Confidence level in the primary diagnosis. Rate your confidence in your diagnosis realistically given the available information." 
              },
              primaryReasoning: { 
                type: "string", 
                description: "Brief explanation of how the primary diagnosis was reached, referencing visual evidence and user context, in Markdown." 
              },
              primaryTreatmentPlan: { 
                type: "string", 
                description: "Brief step-by-step guide for the user to resolve the issue in case of the primary diagnosis, in Markdown." 
              },
              primaryPreventionTips: { 
                type: "string", 
                description: "Brief actionable advice to prevent recurrence in case of the primary diagnosis, in Markdown." 
              },
              secondaryDiagnosis: { 
                type: "string", 
                description: "Secondary diagnosis in case there is another likely possibility of what the issue with the plant could be, other than the primary diagnosis." 
              },
              secondaryConfidence: { 
                type: "string", 
                enum: ["High", "Medium", "Low"], 
                description: "Confidence level in the secondary diagnosis." 
              },
              secondaryReasoning: { 
                type: "string", 
                description: "Brief explanation of how the secondary diagnosis was reached, referencing visual evidence and user context, in Markdown." 
              },
              secondaryTreatmentPlan: { 
                type: "string", 
                description: "Brief step-by-step guide for the user to resolve the issue in case of the secondary diagnosis, in Markdown." 
              },
              secondaryPreventionTips: { 
                type: "string", 
                description: "Brief actionable advice to prevent recurrence in case of the secondary diagnosis, in Markdown." 
              }
            },
            required: ["plant", "primaryDiagnosis", "primaryConfidence", "primaryReasoning", "primaryTreatmentPlan", "primaryPreventionTips"]
          }
        }
      ]
    }
  ] as unknown as import('@google/generative-ai').Tool[];
};
