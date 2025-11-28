import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY || '');

export const getStyleRecommendation = async (
  userDescription: string, 
  faceShape: string,
  hairTexture: string
): Promise<string> => {
  if (!import.meta.env.VITE_API_KEY) {
  throw new Error("API Key is missing.");
}

  const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});
  
  const prompt = `
    Context: You are a professional barber at University Kebangsaan Malaysia (UKM).
    Client: A male university student.
    Constraints: 
    - Wants to look handsome for class/presentations.
    - Needs low maintenance.
    - The haircut costs RM13 (affordable).
    
    Student Profile:
    - Face Shape: ${faceShape}
    - Hair Texture: ${hairTexture}
    - Request: ${userDescription}

    Task: Recommend a specific haircut style. Explain why it suits their face shape. Keep the tone friendly, like a "bro" or "abang" talking to a student. Keep it short (max 100 words).
  `;

    try {
    // Corrected line: Call generateContent on the 'model' instance
    const result = await model.generateContent(prompt); // <--- CHANGE IS HERE
    const response = await result.response; // Get the actual response object

    return response.text() || "Just ask for a Mid Fade bro, always looks good.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI is offline. Just trust the barber!";
  }
};