import { supabase } from '../supabaseClient';

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

/**
 * Calls the secure Supabase Edge Function instead of using a client-side API key
 */
const callGeminiProxy = async (action, payload) => {
  const { data, error } = await supabase.functions.invoke('gemini-proxy', {
    body: { action, payload }
  });
  
  if (error) throw error;
  return data;
};

/**
 * Generates a professional, brutalist-style product description
 */
export const generateProductDescription = async (imageFile, productName) => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Analyze this product image for "Mamta Varieties", a premium lifestyle store. 
    Product name: ${productName}.
    Write a professional, sophisticated, and slightly industrial (brutalist) product description. 
    Keep it concise (2-3 sentences). Focus on quality, craftsmanship, and style. 
    Do not use generic marketing fluff. Speak to a modern, style-conscious audience.`;

    const { text } = await callGeminiProxy('generateContent', [prompt, imagePart]);
    return text;
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
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Identify the primary color of the product in this image.
    Give it a premium-sounding name (2-3 words).
    Return ONLY JSON: { "color": "string" }`;

    const { text } = await callGeminiProxy('generateContent', [prompt, imagePart]);
    // The proxy returns raw text, but we asked for JSON in the prompt
    // We should parse it if possible, but the proxy might have already handled it if we updated it
    // For now, let's assume it returns what the model outputted
    const cleanText = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleanText);
    
    let finalColor = data.color || "Classic Variant";
    finalColor = finalColor.replace(/[*_#"'()]/g, '').trim();
    return finalColor;
  } catch (error) {
    console.error("DETAILED COLOR RECOGNITION ERROR:", error);
    return "Signature Variant";
  }
};

export const generateProductTitle = async (imageFile) => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Generate a concise, premium-sounding product title (3-5 words) for the item shown in this image. Return only the title.`;
    const { text } = await callGeminiProxy('generateContent', [prompt, imagePart]);
    return text.trim();
  } catch (error) {
    console.error("Error generating title:", error);
    return "Premium Product";
  }
};

/**
 * Unified function to analyze product image for title, description, and color
 */
export const analyzeProductImage = async (imageFile) => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Analyze this product image for "Mamta Varieties".
    Generate:
    1. title: A premium product title (3-5 words).
    2. description: A professional, sophisticated description (2-3 sentences).
    3. color: The primary color with a premium name.
    
    Return ONLY JSON:
    { "title": "string", "description": "string", "color": "string" }`;

    const { text } = await callGeminiProxy('generateContent', [prompt, imagePart]);
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error in unified analysis:", error);
    return {
      title: await generateProductTitle(imageFile),
      description: "Premium product from Mamta Varieties.",
      color: await recognizeProductColor(imageFile)
    };
  }
};
