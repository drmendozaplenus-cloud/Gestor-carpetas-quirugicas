
import { GoogleGenAI } from "@google/genai";
import type { SurgicalCase } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateCaseSummary = async (caseData: SurgicalCase): Promise<string> => {
  if (!API_KEY) {
    return "Gemini API key not configured. Summary generation is disabled.";
  }
  
  const prompt = `
    Analyze the following surgical case data and provide a concise summary and a suggested next action.
    The response should be in Spanish.

    Case Data:
    - Patient: ${caseData.patientName}
    - Insurance: ${caseData.insuranceProvider}
    - Folder Status: ${caseData.folderStatus}
    - Follow-up Status: ${caseData.followUpStatus}
    - Key Dates:
        - Request: ${caseData.requestDate ? new Date(caseData.requestDate).toLocaleDateString() : 'N/A'}
        - Submitted: ${caseData.submittedDate ? new Date(caseData.submittedDate).toLocaleDateString() : 'N/A'}
    - Document Checklist:
        - Consent: ${caseData.consent}
        - Budget: ${caseData.budget}
        - Surgeon Report: ${caseData.surgeonReport}
        - Nutritionist Report: ${caseData.nutritionistReport}
        - Psychologist Report: ${caseData.psychologistReport}
    - Current Notes: ${caseData.notes || 'None'}

    Based on this, what is the current situation and the most logical next step for the case manager?
    Format the output clearly with "Resumen del Caso:" and "Próxima Acción Sugerida:".
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error generating summary. Please check the console for details.";
  }
};
