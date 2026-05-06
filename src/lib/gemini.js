import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is missing in your .env file!");
}
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Converts a File object to a base64 string for Gemini API
 */
const fileToGenerativePart = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        inlineData: {
          data: reader.result.split(',')[1],
          mimeType: file.type || "image/jpeg"
        },
      });
    };
    reader.readAsDataURL(file);
  });
};

const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
];

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Generates a professional, brutalist-style product description
 */
export const generateProductDescription = async (imageFile, productName) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, safetySettings });
    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `Analyze this product image for "Mamta Varieties", a premium lifestyle store. 
    Product name: ${productName}.
    Write a professional, sophisticated, and slightly industrial (brutalist) product description. 
    Keep it concise (2-3 sentences). Focus on quality, craftsmanship, and style. 
    Do not use generic marketing fluff. Speak to a modern, style-conscious audience.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating description:", error);
    return `${productName ? productName + " – a premium product from Mamta Varieties." : "Premium product from Mamta Varieties."}`;
  }
};

/**
 * Recognizes the primary color of the product in the image
 */
export const recognizeProductColor = async (imageFile) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME, 
      safetySettings,
      generationConfig: { responseMimeType: "application/json" }
    });
    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `Identify the primary color of the product in this image.
    Give it a premium-sounding name (2-3 words).
    Return ONLY JSON: { "color": "string" }`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const data = JSON.parse(response.text());
    let finalColor = data.color || "Classic Variant";
    
    // Final clean
    finalColor = finalColor.replace(/[*_#"'()]/g, '').trim();
    if (finalColor.toLowerCase().includes("actually") || finalColor.length < 2) {
      return "Classic Variant";
    }

    return finalColor;
  } catch (error) {
    console.error("DETAILED COLOR RECOGNITION ERROR:", error);
    if (imageFile && imageFile.name) {
      const name = imageFile.name.toLowerCase();
      if (name.includes('black')) return "Obsidian Black";
      if (name.includes('white')) return "Cloud White";
      if (name.includes('gold')) return "Champagne Gold";
      if (name.includes('silver')) return "Metallic Silver";
      if (name.includes('blue')) return "Celestial Blue";
      if (name.includes('red')) return "Signal Red";
    }
    return "Signature Variant";
  }
};

export const generateProductTitle = async (imageFile) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, safetySettings });
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Generate a concise, premium-sounding product title (3-5 words) for the item shown in this image. Return only the title.`;
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating title:", error);
    if (imageFile && imageFile.name) {
      const nameWithoutExt = imageFile.name.replace(/\.[^/.]+$/, "");
      return nameWithoutExt.replace(/[_-]+/g, " ").split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
    return "Premium Product";
  }
};

/**
 * Unified function to analyze product image for title, description, and color
 */
export const analyzeProductImage = async (imageFile) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" },
      safetySettings
    });
    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `Analyze this product image for "Mamta Varieties".
    Generate:
    1. title: A premium product title (3-5 words).
    2. description: A professional, sophisticated description (2-3 sentences).
    3. color: The primary color with a premium name.
    
    Return ONLY JSON:
    { "title": "string", "description": "string", "color": "string" }`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error in unified analysis:", error);
    return {
      title: await generateProductTitle(imageFile),
      description: "Premium product from Mamta Varieties.",
      color: await recognizeProductColor(imageFile)
    };
  }
};
