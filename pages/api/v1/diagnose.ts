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

    const {
      plantType, location, wateringFrequency, wateringAmount, wateringMethod, sunlight, sunlightHours,
      soilType, fertilizer, humidity, temperature, pests, symptoms, potDetails, recentChanges, plantAge, description
    } = fields;

    // Build context lines only for provided fields
    const contextLines: string[] = [];
    if (plantType?.[0]) contextLines.push(`- Plant Type: ${plantType[0]}`);
    if (location?.[0]) contextLines.push(`- Location: ${location[0]}`);
    if (wateringFrequency?.[0]) contextLines.push(`- Watering Frequency: ${wateringFrequency[0]}`);
    if (wateringAmount?.[0]) contextLines.push(`- Watering Amount: ${wateringAmount[0]}`);
    if (wateringMethod?.[0]) contextLines.push(`- Watering Method: ${wateringMethod[0]}`);
    if (sunlight?.[0]) contextLines.push(`- Sunlight Exposure: ${sunlight[0]}`);
    if (sunlightHours?.[0]) contextLines.push(`- Sunlight Hours: ${sunlightHours[0]}`);
    if (soilType?.[0]) contextLines.push(`- Soil/Medium: ${soilType[0]}`);
    if (fertilizer?.[0]) contextLines.push(`- Fertilizer: ${fertilizer[0]}`);
    if (humidity?.[0]) contextLines.push(`- Humidity: ${humidity[0]}`);
    if (temperature?.[0]) contextLines.push(`- Temperature: ${temperature[0]}`);
    if (pests?.[0]) contextLines.push(`- Pests: ${pests[0]}`);
    if (symptoms && Array.isArray(symptoms) && symptoms.length > 0) contextLines.push(`- Symptoms: ${symptoms.join(', ')}`);
    if (potDetails?.[0]) contextLines.push(`- Pot/Container Details: ${potDetails[0]}`);
    if (recentChanges?.[0]) contextLines.push(`- Recent Changes: ${recentChanges[0]}`);
    if (plantAge?.[0]) contextLines.push(`- Plant Age: ${plantAge[0]}`);
    if (description?.[0]) contextLines.push(`- User Description: ${description[0]}`);

    const prompt = `
      You are an expert botanist and plant pathologist.
      Your answers should be concise, clear, and actionable.
      You rate your confidence in your diagnosis realistically given the available information.
      In your response, refer to the user as "you" or "your" and NOT as "the user".
      You also include subtle funny computer science references in your responses. Don't make it too obvious, but make some subtle references that a programmer would understand. Avoid using quotation marks.
      The user has provided image(s) and some optional information about their sick plant:
      ${contextLines.length ? contextLines.join('\n') : 'No further information was provided.'}

      Please provide a diagnosis using the 'plant_diagnosis' function call.
    `;

    // Define the function tool for structured output
    const tools = [
      {
        function_declarations: [
          {
            name: "plant_diagnosis",
            description: "Diagnose plant issues and provide brief explanations, treatment and prevention tips.",
            parameters: {
              type: "object",
              properties: {
                plant: { type: "string", description: "Name of the plant in the pictures, both the common name and scientific name. If the user provided the name of the plant, verify it is correct. If it's not, provide the name of the plant that you identify from the pictures. Only provide the name of the plant and nothing else." },
                primaryDiagnosis: { type: "string", description: "Most likely (primary) diagnosis based on the pictures and context." },
                primaryConfidence: { type: "string", enum: ["High", "Medium", "Low"], description: "Confidence level in the primary diagnosis. Rate your confidence in your diagnosis realistically given the available information." },
                primaryReasoning: { type: "string", description: "Brief explanation of how the primary diagnosis was reached, referencing visual evidence and user context, in Markdown." },
                primaryTreatmentPlan: { type: "string", description: "Brief step-by-step guide for the user to resolve the issue in case of the primary diagnosis, in Markdown." },
                primaryPreventionTips: { type: "string", description: "Brief actionable advice to prevent recurrence in case of the primary diagnosis, in Markdown." },
                secondaryDiagnosis: { type: "string", description: "Secondary diagnosis in case there is another likely possibility of what the issue with the plant could be, other than the primary diagnosis." },
                secondaryConfidence: { type: "string", enum: ["High", "Medium", "Low"], description: "Confidence level in the secondary diagnosis." },
                secondaryReasoning: { type: "string", description: "Brief explanation of how the secondary diagnosis was reached, referencing visual evidence and user context, in Markdown." },
                secondaryTreatmentPlan: { type: "string", description: "Brief step-by-step guide for the user to resolve the issue in case of the secondary diagnosis, in Markdown." },
                secondaryPreventionTips: { type: "string", description: "Brief actionable advice to prevent recurrence in case of the secondary diagnosis, in Markdown." }

              },
              required: ["plant", "primaryDiagnosis", "primaryConfidence", "primaryReasoning", "primaryTreatmentPlan", "primaryPreventionTips"]
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
        },
      ],
      tools,
      generationConfig: {
        temperature: 0.1,
        topP: 0.5
      }
    });
    const response = await result.response;
    let jsonResponse;
    try {
      const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;
      if (functionCall && functionCall.args) {
        jsonResponse = functionCall.args;
        res.status(200).json(jsonResponse);
      } else {
        throw new Error("No structured function call response from Gemini.");
      }
    } catch (e) {
      console.error("Failed to parse Gemini structured response:", e, response);
      res.status(500).json({ error: "Failed to get a valid diagnosis, please try again. If the error persists, please change your inputs." });
    }

  } catch (error: any) {
    console.error('Error in diagnose API:', error);
    res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}