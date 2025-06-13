
import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from '../shared/FileUpload'; 
import { TextArea } from '../shared/TextArea';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ResultCard } from '../shared/ResultCard';
import { Alert } from '../shared/Alert';
import { describeVideoContent } from '../../services/geminiService';
import { VideoDescriberResult, ApiError, BaseFeatureProps, ActionType } from '../../types';
import { MAX_VIDEO_SIZE_MB } from '../../constants';

export const VideoDescriber: React.FC<BaseFeatureProps> = ({ voiceCommand, clearVoiceCommand }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPrompt, setVideoPrompt] = useState<string>("");
  const [result, setResult] = useState<VideoDescriberResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File, _: string | null) => {
     if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        setError(`Video file metadata is being used, but the file seems large. Max size for this demo: ${MAX_VIDEO_SIZE_MB}MB.`);
    }
    setVideoFile(file);
    setVideoPrompt(prev => prev || `Describe potential content or generate ideas for a video titled "${file.name}".`);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!videoPrompt.trim()) {
      setError("Please enter a description or topic for the video content.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const fullPrompt = videoFile 
        ? `For a video titled "${videoFile.name}", consider the following: ${videoPrompt}`
        : videoPrompt;
      const analysisResult = await describeVideoContent(fullPrompt);
      setResult(analysisResult);
    } catch (e) {
      const apiError = e as ApiError;
      setError(apiError.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (voiceCommand) {
        const lowerCmd = voiceCommand.toLowerCase();
        if (lowerCmd.startsWith(ActionType.SET_INPUT.replace('_', ' ').toLowerCase()) || lowerCmd.startsWith("input prompt")) {
            const textToSet = voiceCommand.substring(voiceCommand.indexOf(' ') + 1);
            setVideoPrompt(textToSet);
        } else if (lowerCmd.includes(ActionType.SUBMIT_VIDEO_PROMPT.replace('_', ' ').toLowerCase()) || lowerCmd.includes("describe video") || lowerCmd.includes("summarize video")) {
            const describePrefix = "describe video ";
            const summarizePrefix = "summarize video ";
            let promptText = videoPrompt; 

            if (lowerCmd.startsWith(describePrefix) && lowerCmd.length > describePrefix.length) {
                promptText = voiceCommand.substring(describePrefix.length);
            } else if (lowerCmd.startsWith(summarizePrefix) && lowerCmd.length > summarizePrefix.length) {
                promptText = voiceCommand.substring(summarizePrefix.length);
            }
            
            setVideoPrompt(promptText); 
            if (promptText.trim()) { 
                 setTimeout(handleSubmit, 100);
            } else {
                setError("Please provide a prompt for the video via text or voice.");
            }
        }
      clearVoiceCommand();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceCommand, clearVoiceCommand, videoPrompt]);


  return (
    <div>
      <h2 className="text-2xl font-semibold text-neutral-dark dark:text-neutral-light-accent mb-6">AI Video Content Describer</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        This tool helps generate ideas, summaries, or potential captions for video content. 
        You can optionally "upload" a video file (only its name will be used for context, not the content itself). 
        Then, provide a text prompt describing the video's topic or a specific scene. The AI will generate relevant textual descriptions.
      </p>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <FileUpload 
        onFileSelect={handleFileSelect} 
        accept="video/*" 
        label="Optionally, upload a video file (metadata only)"
        fileTypeLabel="video"
      />

      <TextArea 
        label="Describe the video content or topic:"
        value={videoPrompt}
        onChange={(e) => setVideoPrompt(e.target.value)}
        placeholder="e.g., 'A cooking tutorial for a chocolate cake', 'Generate key scenes for a sci-fi short film about time travel', 'What are some accessibility considerations for a product demo video?'"
        rows={4}
      />
      
      <Button 
        onClick={handleSubmit} 
        disabled={!videoPrompt.trim() || isLoading}
        isLoading={isLoading}
        icon="fas fa-film"
        className="w-full sm:w-auto"
      >
        Generate Video Description
      </Button>

      {isLoading && <LoadingSpinner text="Generating video ideas..." />}

      {result && (
        <ResultCard title="Video Content Ideas" icon="fas fa-lightbulb" className="mt-6">
          <h4 className="font-semibold text-md text-secondary dark:text-secondary-light">Summary:</h4>
          <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-sm">{result.summary}</p>
          
          {result.potentialKeywords && result.potentialKeywords.length > 0 && (
            <>
              <h4 className="font-semibold text-md text-secondary dark:text-secondary-light mt-4">Potential Keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {result.potentialKeywords.map((keyword, index) => (
                  <span key={index} className="bg-secondary-light text-secondary-dark dark:bg-secondary-dark dark:text-secondary-light px-3 py-1 rounded-full text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </>
          )}

          {result.scenes && result.scenes.length > 0 && (
             <>
              <h4 className="font-semibold text-md text-secondary dark:text-secondary-light mt-4">Hypothetical Scenes:</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.scenes.map((scene, index) => (
                  <li key={index} className="text-sm">
                    {scene.timestamp && <span className="font-mono text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded mr-1">{scene.timestamp}</span>}
                    {scene.description}
                  </li>
                ))}
              </ul>
            </>
          )}
        </ResultCard>
      )}
    </div>
  );
};