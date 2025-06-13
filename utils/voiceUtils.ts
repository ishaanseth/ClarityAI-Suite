
import { Feature, ActionType, VoiceCommandAction } from '../types';
import { interpretNavigationIntent } from '../services/geminiService';

// This parser now uses Gemini for navigation and falls back to keyword matching for feature-specific actions.
export const parseVoiceCommand = async (
  transcript: string, 
  currentFeature: Feature,
  featureNavigationLabels: string[] // Pass the labels for Gemini
): Promise<VoiceCommandAction> => {
  const lowerTranscript = transcript.toLowerCase();

  // 1. Try Gemini for navigation intent first
  try {
    const navigationTarget = await interpretNavigationIntent(lowerTranscript, featureNavigationLabels);
    if (navigationTarget) {
      return { type: ActionType.SWITCH_FEATURE, payload: navigationTarget };
    }
  } catch (error) {
    console.error("Gemini navigation intent parsing failed:", error);
    // Fallthrough to other parsing methods or return UNKNOWN
  }

  // 2. Feature-specific command keywords (simple matching)
  // The actual logic for these actions will be in the respective feature components
  // based on the `voiceCommand` prop.
  switch (currentFeature) {
    case Feature.IMAGE_ANALYZER:
      if (lowerTranscript.includes("analyze image") || lowerTranscript.includes("describe image") || lowerTranscript.includes("submit image")) {
        return { type: ActionType.SUBMIT_IMAGE, payload: transcript };
      }
      break;
    case Feature.COLOR_CONTRAST_CHECKER:
      if (lowerTranscript.includes("check contrast") || lowerTranscript.includes("analyze colors") || lowerTranscript.includes("submit colors")) {
        return { type: ActionType.SUBMIT_COLORS, payload: transcript };
      }
      if (lowerTranscript.startsWith("set foreground") || lowerTranscript.startsWith("set background") || lowerTranscript.startsWith("foreground") || lowerTranscript.startsWith("background")) {
        return {type: ActionType.SET_INPUT, payload: transcript }; // Pass full transcript for component to parse color value
      }
      break;
    case Feature.TEXT_SIMPLIFIER:
      if (lowerTranscript.includes("simplify text") || lowerTranscript.includes("submit text")) {
        return { type: ActionType.SUBMIT_TEXT, payload: transcript };
      }
      if (lowerTranscript.startsWith("input text") || lowerTranscript.startsWith("set input to") || lowerTranscript.startsWith("simplify this text")) {
         return {type: ActionType.SET_INPUT, payload: transcript };
      }
      break;
    case Feature.VIDEO_DESCRIBER:
      if (lowerTranscript.includes("describe video") || lowerTranscript.includes("summarize video") || lowerTranscript.includes("submit video prompt")) {
        return { type: ActionType.SUBMIT_VIDEO_PROMPT, payload: transcript };
      }
      if (lowerTranscript.startsWith("input prompt") || lowerTranscript.startsWith("set prompt to")) {
         return {type: ActionType.SET_INPUT, payload: transcript };
      }
      break;
    default:
      break;
  }
  
  // 3. Generic input command if no specific action or navigation matched
  if (lowerTranscript.startsWith("input") || lowerTranscript.startsWith("set text to") || lowerTranscript.startsWith("type")) {
    // Check if this input command is more specific to a feature, e.g., "input text 'hello'" for TextSimplifier
    // For now, kept generic. Could be enhanced with interpretVoiceCommandForGemini for more context.
    return { type: ActionType.SET_INPUT, payload: transcript };
  }

  return { type: ActionType.UNKNOWN, payload: transcript };
};
