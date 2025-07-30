import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import { initializeGemini, bufferToGenerativePart } from '../../../utils/geminiHelpers';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { modelFlashLite } = initializeGemini();

    const form = formidable({});
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing form data' });
      }
      
      const images = Array.isArray(files.images) ? files.images : files.images ? [files.images] : [];
      if (!images.length) {
        return res.status(400).json({ error: 'No images provided' });
      }
      
      try {
        // Prepare image parts
        const imageParts = await Promise.all(
          images.map(async (file: File) => {
            const buffer = await fs.readFile(file.filepath);
            return bufferToGenerativePart(buffer, file);
          })
        );
        
        // Prompt for plant name only
        const prompt = `Identify the plant in the provided image(s). Only reply with the plant name, nothing else. 
        Use the name that an average person familiar with plants would use.
        E.g., for Monstera Deliciosa, reply 'Monstera' or 'Monstera Deliciosa' and not 'Swiss Cheese Plant', since the scientific name is commonly known.
        However, for a plant with an unknown scientific name and a well-known common name, use the common name.
        If no plant is detected, or there are clearly multiple plants on the pictures, or the plant name cannot be identified with high certainty, reply with a blank string ''.`;

        const result = await modelFlashLite.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }, ...imageParts],
            },
          ],
          generationConfig: { temperature: 0.1, topP: 0.5 },
        });
        
        const response = await result.response;
        let plantName = '';
        try {
          plantName = response.text().trim();
        } catch {
          plantName = '';
        }
        
        if (!plantName) plantName = 'Unknown';
        res.status(200).json({ plantName });
      } catch (e) {
        res.status(500).json({ error: 'Failed to identify plant name' });
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}
