import { GoogleGenAI, Type } from "@google/genai";
import { Platform, GeneratedFormula } from '../types';

// NOTE: In a real production app, this key should be proxied through a backend.
// For this frontend-only demo, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-2.5-flash';

export const generateFormulaFromAI = async (
  prompt: string,
  platform: Platform
): Promise<GeneratedFormula> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const systemInstruction = `
    You are an expert Excel and Google Sheets Formula Bot. 
    Your goal is to translate natural language user requests into precise, working spreadsheet formulas.
    
    Rules:
    1. Output strictly valid formulas for the requested platform (${platform}).
    2. If the user asks for something impossible with a formula (e.g., "make coffee"), politely explain why in the explanation field, but return "N/A" for the formula.
    3. Determine the complexity (Basic, Intermediate, Advanced).
    4. Provide a clear, concise explanation of how the formula works.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Create a ${platform} formula for: "${prompt}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            formula: {
              type: Type.STRING,
              description: "The executable spreadsheet formula, starting with = if applicable.",
            },
            explanation: {
              type: Type.STRING,
              description: "A concise explanation of the logic.",
            },
            complexity: {
              type: Type.STRING,
              description: "The complexity level: Basic, Intermediate, or Advanced.",
            }
          },
          required: ["formula", "explanation", "complexity"]
        }
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response generated from Gemini.");
    }

    const json = JSON.parse(text);

    return {
      formula: json.formula,
      explanation: json.explanation,
      complexity: json.complexity,
      platform: platform
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate formula. Please try again.");
  }
};