import type { NextApiRequest, NextApiResponse } from 'next';
import { formidable } from 'formidable';
import { 
  initializeGemini, 
  processImages, 
  buildSimpleContextLines, 
  getInitialDiagnosis, 
  rankDiagnoses 
} from '../../../utils/geminiHelpers';

// Disable Next.js body parsing to allow formidable to handle the stream
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { modelFlash, modelFlashLite } = initializeGemini();

    try {
      const form = formidable({ 
        multiples: true,
        maxFiles: 5,
        maxFileSize: 5 * 1024 * 1024, // 5MB limit per file
        filter: function ({ name, originalFilename, mimetype }) {
          return mimetype && mimetype.includes('image');
        }
      });

      const [fields, files] = await form.parse(req);

      const imageFiles = Array.isArray(files.images) ? files.images : [files.images].filter(Boolean);
      if (!imageFiles || imageFiles.length === 0) {
        return res.status(400).json({ error: 'No valid images uploaded.' });
      }

      // Process images with resizing and quality optimization
      console.log("Processing", imageFiles.length, "images for intermediate diagnosis");
      const imageParts = await processImages(imageFiles);

      // Build context from form fields (simplified for intermediate diagnosis)
      const contextLines = buildSimpleContextLines(fields);
      console.log("Context for intermediate diagnosis:", contextLines);

      // Step 1: Get three initial diagnoses from the image(s) using Flash model
      console.log("Starting 3 parallel Gemini Flash calls for initial diagnoses...");
      const diagnosisPromises = [
        getInitialDiagnosis(modelFlash, imageParts, contextLines, 0),
        getInitialDiagnosis(modelFlash, imageParts, contextLines, 1),
        getInitialDiagnosis(modelFlash, imageParts, contextLines, 2)
      ];
      const diagnosisResults = await Promise.all(diagnosisPromises);
      
      // Step 1.5: Group and rank diagnoses by frequency
      console.log("Calling Gemini Flash Lite to rank and group diagnoses...");
      const rankedDiagnoses = await rankDiagnoses(modelFlashLite, diagnosisResults);

      // Parse the ranked diagnoses into an array
      const rankedDiagnosesArray = rankedDiagnoses
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);

      console.log("Final ranked diagnoses array for UI:", rankedDiagnosesArray);
      console.log("Raw ranked diagnoses string:", rankedDiagnoses);
      res.status(200).json({ rankedDiagnoses: rankedDiagnosesArray });

    } catch (error: any) {
      console.error('Error in intermediate diagnose API:', error);
      res.status(500).json({ error: error.message || 'An internal server error occurred.' });
    }
  } catch (error: any) {
    console.error('Top-level API error:', error);
    res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}
