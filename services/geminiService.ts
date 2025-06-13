
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';
import { ColorContrastAnalysis, ImageAnalysisResult, TextSimplificationResult, VideoDescriberResult, Feature } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set. Please ensure process.env.API_KEY is available.");
  // Potentially throw an error or display a message to the user in a real app context
  // For this sandbox, we'll let it try and fail if the key isn't there.
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Use non-null assertion as API_KEY presence is an external requirement.

// Helper to map string labels from navItems back to Feature enum values
const labelToFeatureMap: { [label: string]: Feature } = {
  'Image Describer': Feature.IMAGE_ANALYZER,
  'Color Contrast': Feature.COLOR_CONTRAST_CHECKER,
  'Text Simplifier': Feature.TEXT_SIMPLIFIER,
  'Video Describer': Feature.VIDEO_DESCRIBER,
};


function parseJsonFromMarkdown<T,>(jsonString: string): T | null {
  let str = jsonString.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = str.match(fenceRegex);
  if (match && match[2]) {
    str = match[2].trim();
  }
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original string:", jsonString);
    // Fallback: if the raw string itself is valid JSON (sometimes Gemini might not use fences for simple JSON)
    try {
        return JSON.parse(jsonString) as T;
    } catch (e2) {
        console.error("Failed to parse raw string as JSON:", e2);
        return null; // Or throw, or return a custom error object
    }
  }
}

export const generateImageDescription = async (base64ImageData: string, mimeType: string): Promise<ImageAnalysisResult> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64ImageData,
      },
    };
    const textPart = {
      text: `Describe this image for web accessibility (alt text). Focus on conveying the meaning and context. If there's text, include it. Be concise yet informative. Also, provide up to 5 relevant tags for the image. Respond in JSON format with keys "description" and "tags" (an array of strings). Example: {"description": "A black cat sitting on a red couch.", "tags": ["cat", "animal", "pet", "couch", "indoor"]}`
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT, 
      contents: { parts: [imagePart, textPart] },
      config: { responseMimeType: "application/json" }
    });

    const resultJson = parseJsonFromMarkdown<ImageAnalysisResult>(response.text);
    if (resultJson && resultJson.description) {
      return resultJson;
    }
    // Fallback if JSON parsing fails or structure is not as expected
    return { description: response.text || "Could not get description from AI.", tags: [] };

  } catch (error) {
    console.error("Error generating image description:", error);
    throw new Error("Failed to generate image description. Please ensure your API key is correctly configured.");
  }
};

export const analyzeColorContrast = async (color1: string, color2: string): Promise<ColorContrastAnalysis> => {
  try {
    const prompt = `Analyze the color contrast between foreground color ${color1} and background color ${color2} for web accessibility. 
Provide:
1. The contrast ratio.
2. Compliance with WCAG AA and AAA for normal and large text (true/false for each of the 4 combinations).
3. If not accessible, suggest 1-2 alternative color pairs (foreground & background) that are accessible (WCAG AA for normal text) and maintain a similar color feel if possible.
4. A brief feedback summary.
Respond in JSON format with keys: "isAccessible" (boolean, overall for AA normal text), "ratio" (number), "wcagAaSmallText" (boolean), "wcagAaLargeText" (boolean), "wcagAaaSmallText" (boolean), "wcagAaaLargeText" (boolean), "suggestions" (array of objects with "foregroundColor", "backgroundColor", "notes"), and "feedback" (string).`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const resultJson = parseJsonFromMarkdown<ColorContrastAnalysis>(response.text);
    if (resultJson && typeof resultJson.isAccessible !== 'undefined') {
        return resultJson;
    }
    // Fallback for safety
    return { 
        feedback: response.text || "Could not get analysis from AI.", 
        isAccessible: false, 
        wcagAaLargeText: false, wcagAaSmallText: false, 
        wcagAaaLargeText: false, wcagAaaSmallText: false 
    };

  } catch (error) {
    console.error("Error analyzing color contrast:", error);
    throw new Error("Failed to analyze color contrast. Please ensure your API key is correctly configured.");
  }
};

export const simplifyText = async (textToSimplify: string): Promise<TextSimplificationResult> => {
  try {
    const prompt = `Simplify the following text for better readability, targeting a general audience (around Grade 8 reading level). 
Maintain the core meaning. Provide the simplified text. Also, briefly mention the kind of improvement (e.g., "Simplified complex sentences and vocabulary").
Respond in JSON format with keys: "originalText", "simplifiedText", and "readingLevelImprovement" (string).
Original Text: "${textToSimplify}"`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const resultJson = parseJsonFromMarkdown<TextSimplificationResult>(response.text);
     if (resultJson && resultJson.simplifiedText) {
        return { ...resultJson, originalText: textToSimplify };
    }
    return { originalText: textToSimplify, simplifiedText: response.text || "Could not simplify text.", readingLevelImprovement: "N/A" };

  } catch (error) {
    console.error("Error simplifying text:", error);
    throw new Error("Failed to simplify text. Please ensure your API key is correctly configured.");
  }
};

export const describeVideoContent = async (promptAboutVideo: string): Promise<VideoDescriberResult> => {
  try {
    const prompt = `Based on the following description or topic for a video: "${promptAboutVideo}", generate:
1. A concise overall summary of the potential video content.
2. Up to 5 potential keywords.
3. A list of 2-3 hypothetical key scenes with brief descriptions (e.g., {timestamp: "0:30", description: "Character A discovers a map."}).
Respond in JSON format with keys: "summary" (string), "potentialKeywords" (array of strings), and "scenes" (array of objects with optional "timestamp" and "description").`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const resultJson = parseJsonFromMarkdown<VideoDescriberResult>(response.text);
    if (resultJson && resultJson.summary) {
        return resultJson;
    }
    return { summary: response.text || "Could not generate video description.", potentialKeywords: [], scenes: [] };

  } catch (error) {
    console.error("Error describing video content:", error);
    throw new Error("Failed to describe video content. Please ensure your API key is correctly configured.");
  }
};

export const interpretVoiceCommandForGemini = async (transcript: string, currentFeature: string, availableActions: string[]): Promise<string> => {
  try {
    const prompt = `User is on the "${currentFeature}" feature of an accessibility app and said: "${transcript}". 
    The available actions for this feature are: ${availableActions.join(', ')}. 
    Which action are they most likely trying to perform? Respond with ONLY the action name (e.g., "SUBMIT_IMAGE") or "UNKNOWN".`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error interpreting voice command with Gemini:", error);
    // Rethrow or handle more gracefully if needed, e.g. by returning a specific error code or string.
    throw new Error("Failed to interpret voice command using AI. Please ensure API key is valid and network is stable.");
  }
};

export const interpretNavigationIntent = async (transcript: string, featureLabels: string[]): Promise<Feature | null> => {
  if (!API_KEY) {
    console.warn("API_KEY not available for interpretNavigationIntent. Skipping Gemini call.");
    return null; // Or throw error, depending on desired behavior
  }
  try {
    const prompt = `Given the user transcript "${transcript}", which of the following navigation targets are they most likely trying to select? 
Targets: ${featureLabels.join(', ')}. 
Respond with ONLY the exact target name from the list, or "UNKNOWN" if it's not a clear match for any target.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
    });

    const geminiResponseText = response.text.trim();
    
    if (labelToFeatureMap[geminiResponseText]) {
      return labelToFeatureMap[geminiResponseText];
    }
    return null; // No matching feature label found in Gemini's response
  } catch (error) {
    console.error("Error interpreting navigation intent with Gemini:", error);
    // Optionally, rethrow or return null to allow fallback mechanisms
    // throw new Error("Failed to interpret navigation intent using AI."); 
    return null; // Gracefully fail, allowing other parsing logic to proceed
  }
};
