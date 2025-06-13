
import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from '../shared/FileUpload';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ResultCard } from '../shared/ResultCard';
import { Alert } from '../shared/Alert';
import { generateImageDescription } from '../../services/geminiService';
import { ImageAnalysisResult, ApiError, BaseFeatureProps, ActionType } from '../../types';
import { MAX_IMAGE_SIZE_MB } from '../../constants';

export const ImageAnalyzer: React.FC<BaseFeatureProps> = ({ voiceCommand, clearVoiceCommand }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null); 

  const handleFileSelect = useCallback((file: File, base64Data: string | null) => {
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setError(`Image too large. Max size: ${MAX_IMAGE_SIZE_MB}MB. Please select a smaller image.`);
        setSelectedFile(null);
        setBase64Image(null);
        return;
    }
    setSelectedFile(file);
    setBase64Image(base64Data);
    setResult(null); 
    setError(null); 
  }, []);

  const handleSubmit = async () => {
    if (!base64Image || !selectedFile) {
      setError("Please select an image first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await generateImageDescription(base64Image.split(',')[1], selectedFile.type); 
      setResult(analysisResult);
    } catch (e) {
      const apiError = e as ApiError;
      setError(apiError.message || "An unknown error occurred while analyzing the image.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (voiceCommand) {
      if (voiceCommand.toLowerCase().includes(ActionType.SUBMIT_IMAGE.replace('_', ' ').toLowerCase()) || voiceCommand.toLowerCase().includes('analyze image') || voiceCommand.toLowerCase().includes('describe image')) {
        handleSubmit();
      }
      clearVoiceCommand();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceCommand, clearVoiceCommand]);


  return (
    <div>
      <h2 className="text-2xl font-semibold text-neutral-dark dark:text-neutral-light-accent mb-6">AI Image Describer</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">Upload an image to get an AI-generated description (alt text) and relevant tags. This helps make visual content accessible to users who rely on screen readers.</p>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <FileUpload 
        onFileSelect={handleFileSelect} 
        accept="image/*" 
        label="Drag and drop an image here, or click to select"
        fileTypeLabel="image"
      />
      
      <Button 
        onClick={handleSubmit} 
        disabled={!selectedFile || isLoading}
        isLoading={isLoading}
        icon="fas fa-wand-magic-sparkles"
        className="w-full sm:w-auto"
      >
        Generate Description
      </Button>

      {isLoading && <LoadingSpinner text="Analyzing image..." />}

      {result && (
        <ResultCard title="Image Analysis Complete" icon="fas fa-check-circle" className="mt-6">
          <h4 className="font-semibold text-md text-secondary dark:text-secondary-light">Suggested Alt Text:</h4>
          <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-sm" aria-label="Generated alt text">{result.description}</p>
          
          {result.tags && result.tags.length > 0 && (
            <>
              <h4 className="font-semibold text-md text-secondary dark:text-secondary-light mt-4">Detected Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag, index) => (
                  <span key={index} className="bg-secondary-light text-secondary-dark dark:bg-secondary-dark dark:text-secondary-light px-3 py-1 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </ResultCard>
      )}
    </div>
  );
};