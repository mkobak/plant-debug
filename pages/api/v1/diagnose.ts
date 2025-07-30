import type { NextApiRequest, NextApiResponse } from 'next';
import { formidable } from 'formidable';
import fs from 'fs/promises';
import { 
  initializeGemini, 
  bufferToGenerativePart, 
  buildContextLines, 
  getDiagnosisTools,
  generateSummary
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

    const { modelPro, modelFlashLite } = initializeGemini();

    try {
      const form = formidable({});
      const [fields, files] = await form.parse(req);

      const imageFiles = files.images;
      if (!imageFiles || imageFiles.length === 0) {
        return res.status(400).json({ error: 'No images uploaded.' });
      }

      console.log("=== FINAL DIAGNOSIS API CALL ===");
      // Log image sizes after upload
      for (const file of imageFiles) {
        const buffer = await fs.readFile(file.filepath);
        console.log(`Uploaded image: ${file.originalFilename || file.filepath}, size: ${buffer.length} bytes (${(buffer.length/1024).toFixed(1)} KB)`);
      }

      const { rankedDiagnoses } = fields;

      // Build context lines from form fields
      const contextLines = buildContextLines(fields);
      console.log("Full context for final diagnosis:", contextLines);

      // Process images for Gemini
      console.log("Processing images for Gemini Pro final diagnosis...");
      const imageParts = await Promise.all(imageFiles.map(async (file) => {
        const buffer = await fs.readFile(file.filepath);
        return bufferToGenerativePart(buffer, file);
      }));

      // Get the ranked diagnoses (provided from intermediate step)
      const finalRankedDiagnoses = rankedDiagnoses && rankedDiagnoses[0] ? rankedDiagnoses[0] : "";
      console.log("Ranked diagnoses received from intermediate step:", finalRankedDiagnoses);

      // Main prompt with structured output
      const prompt = `
        You are an expert botanist and plant pathologist.
        Your answers should be concise, clear, and actionable.
        You rate your confidence in your diagnosis realistically given the available information.
        In your response, refer to the user as 'you' and NOT as 'the user'.
        You also include subtle funny computer science references in your responses. Don't make it too obvious, but make subtle references that a programmer would understand. Avoid using quotation marks and starting sentences with 'think of it as' or 'this/it is like'.
        The user has provided image(s) and some optional information about their sick plant:
        ${contextLines.length ? contextLines.join('\n') : 'No further information was provided.'}

        Treat the image(s) as the primary source of information. Inspect them very closely for any signs of early pest activity. Consider also the rest of the user's input if provided, but treat it as a starting point rather than the sole basis for your diagnosis.

        ${finalRankedDiagnoses ? `The following diagnoses were ranked by frequency by other plant experts: ${finalRankedDiagnoses}.
        Consider this ranked list in your answer. Do not mention the other experts and their diagnoses in your response.` : ''}

        Please provide a diagnosis using the 'plant_diagnosis' function call.
      `;
      console.log("Gemini Pro structured prompt:", prompt);

      const tools = getDiagnosisTools();
      console.log("Calling Gemini Pro for final structured diagnosis...");

      const result = await modelPro.generateContent({
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
          temperature: 0.1, // Lower for more consistent answers
          topP: 0.5         // Optional: lower for less randomness
        }
      });

      const response = await result.response;
      console.log("Gemini Pro raw response structure:", {
        candidates: response.candidates?.length,
        hasFunctionCall: !!response.candidates?.[0]?.content?.parts?.[0]?.functionCall
      });
      console.log("Gemini Pro function call response:", response.candidates?.[0]?.content?.parts?.[0]?.functionCall);
      
      try {
        // Gemini function calling responses are in response.candidates[0].content.parts[0].functionCall.args
        const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;
        if (functionCall && functionCall.args) {
          const jsonResponse = functionCall.args;
          
          // Generate summaries using Flash Lite
          let summaries = { primarySummary: "", secondarySummary: "" };
          try {
            summaries = await generateSummary(modelFlashLite, jsonResponse);
          } catch (summaryError) {
            console.error("Failed to generate summaries:", summaryError);
            // Continue without summaries if it fails
          }
          
          // Add summaries to response if generated successfully
          const finalResponse = {
            ...jsonResponse,
            ...(summaries.primarySummary && { primarySummary: summaries.primarySummary }),
            ...(summaries.secondarySummary && { secondarySummary: summaries.secondarySummary })
          };
          
          console.log("Final diagnosis response being sent to client:", JSON.stringify(finalResponse, null, 2));
          res.status(200).json(finalResponse);
        } else {
          throw new Error("No structured function call response from Gemini.");
        }
      } catch (e) {
        console.error("Failed to parse Gemini Pro structured response:", e, response);
        res.status(500).json({ error: "Failed to get a valid diagnosis, please try again. If the error persists, please provide more/different images and context." });
      }

    } catch (error: any) {
      console.error('Error in diagnose API:', error);
      res.status(500).json({ error: error.message || 'An internal server error occurred.' });
    }
  } catch (error: any) {
    console.error('Top-level API error:', error);
    res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}