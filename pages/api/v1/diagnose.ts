import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { formidable, File } from 'formidable';
import fs from 'fs/promises';

// Disable Next.js body parsing to allow formidable to handle the stream
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to convert file to a Gemini-compatible format
const fileToGenerativePart = async (file: File) => {
  const buffer = await fs.readFile(file.filepath);
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: file.mimetype || 'application/octet-stream',
    },
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const imageFiles = files.images;
    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ error: 'No images uploaded.' });
    }

    const { plantType, location, watering, sunlight } = fields;

    const prompt = `
      You are an expert botanist and plant pathologist.
      A user has provided the following information about their sick plant:
      - Plant Type: ${plantType?.[0] || 'Not provided'}
      - Location: ${location?.[0] || 'Not provided'}
      - Watering Schedule: ${watering?.[0] || 'Not provided'}
      - Sunlight Exposure: ${sunlight?.[0] || 'Not provided'}

      Based on this context and the attached image(s), please provide a diagnosis.
    `;

    // Define the function tool for structured output
    const tools = [
      {
        function_declarations: [
          {
            name: "plant_diagnosis",
            description: "Diagnose plant issues and provide treatment and prevention tips.",
            parameters: {
              type: "object",
              properties: {
                diagnosis: { type: "string", description: "Primary diagnosis (e.g., Spider Mite Infestation, Fungal Rust, Overwatering leading to Root Rot)" },
                confidence: { type: "string", enum: ["High", "Medium", "Low"], description: "Confidence level in the diagnosis" },
                reasoning: { type: "string", description: "Brief explanation of how the diagnosis was reached, referencing visual evidence and user context, in Markdown." },
                treatmentPlan: { type: "string", description: "Brief step-by-step guide for the user to resolve the issue, in Markdown." },
                preventionTips: { type: "string", description: "Brief actionable advice to prevent recurrence, in Markdown." }
              },
              required: ["diagnosis", "confidence", "reasoning", "treatmentPlan", "preventionTips"]
            }
          }
        ]
      }
    ] as unknown as import('@google/generative-ai').Tool[];

    const imageParts = await Promise.all(
      imageFiles.map(fileToGenerativePart)
    );

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            ...imageParts
          ]
        }
      ],
      tools
    });
    const response = await result.response;
    let jsonResponse;
    try {
      // Gemini function calling responses are in response.candidates[0].content.parts[0].functionCall.args
      const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;
      if (functionCall && functionCall.args) {
        jsonResponse = functionCall.args;
        res.status(200).json(jsonResponse);
      } else {
        throw new Error("No structured function call response from Gemini.");
      }
    } catch (e) {
      console.error("Failed to parse Gemini structured response:", e, response);
      res.status(500).json({ error: "Failed to get a valid diagnosis format from the AI." });
    }

  } catch (error: any) {
    console.error('Error in diagnose API:', error);
    res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}