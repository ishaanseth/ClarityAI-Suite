
export enum Feature {
  IMAGE_ANALYZER = 'Image Analyzer',
  COLOR_CONTRAST_CHECKER = 'Color Contrast Checker',
  TEXT_SIMPLIFIER = 'Text Simplifier',
  VIDEO_DESCRIBER = 'Video Describer',
}

export interface ImageAnalysisResult {
  description: string;
  tags?: string[];
}

export interface ColorContrastAnalysis {
  isAccessible: boolean;
  ratio?: number;
  wcagAaSmallText: boolean;
  wcagAaLargeText: boolean;
  wcagAaaSmallText: boolean;
  wcagAaaLargeText: boolean;
  suggestions?: {
    foregroundColor: string;
    backgroundColor: string;
    notes: string;
  }[];
  feedback: string;
}

export interface TextSimplificationResult {
  originalText: string;
  simplifiedText: string;
  readingLevelImprovement?: string; // e.g., "Reduced from Grade 12 to Grade 8"
}

export interface VideoDescriberResult {
  summary: string;
  potentialKeywords?: string[];
  scenes?: {timestamp?: string, description: string}[];
}

export interface ApiError {
  message: string;
  code?: number;
}

export interface BaseFeatureProps {
  voiceCommand: string | null;
  clearVoiceCommand: () => void;
}

export enum ActionType {
  SUBMIT_IMAGE = "SUBMIT_IMAGE",
  SUBMIT_COLORS = "SUBMIT_COLORS",
  SUBMIT_TEXT = "SUBMIT_TEXT",
  SUBMIT_VIDEO_PROMPT = "SUBMIT_VIDEO_PROMPT",
  SET_INPUT = "SET_INPUT",
  SWITCH_FEATURE = "SWITCH_FEATURE",
  UNKNOWN = "UNKNOWN",
}

export interface VoiceCommandAction {
  type: ActionType;
  payload?: string | Feature; 
}
