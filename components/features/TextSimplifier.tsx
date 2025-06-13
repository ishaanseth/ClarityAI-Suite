
import React, { useState, useCallback, useEffect } from 'react';
import { TextArea } from '../shared/TextArea';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ResultCard } from '../shared/ResultCard';
import { Alert } from '../shared/Alert';
import { simplifyText } from '../../services/geminiService';
import { TextSimplificationResult, ApiError, BaseFeatureProps, ActionType } from '../../types';

export const TextSimplifier: React.FC<BaseFeatureProps> = ({ voiceCommand, clearVoiceCommand }) => {
  const [originalText, setOriginalText] = useState<string>("");
  const [result, setResult] = useState<TextSimplificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!originalText.trim()) {
      setError("Please enter some text to simplify.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const analysisResult = await simplifyText(originalText);
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
      if (lowerCmd.startsWith(ActionType.SET_INPUT.replace('_', ' ').toLowerCase()) || lowerCmd.startsWith("input text")) {
        const textToSet = voiceCommand.substring(voiceCommand.indexOf(' ') + 1);
        setOriginalText(textToSet);
      } else if (lowerCmd.includes(ActionType.SUBMIT_TEXT.replace('_', ' ').toLowerCase()) || lowerCmd.includes("simplify this")) {
        const simplifyPrefix = "simplify text ";
        if (lowerCmd.startsWith(simplifyPrefix) && lowerCmd.length > simplifyPrefix.length) {
            setOriginalText(voiceCommand.substring(simplifyPrefix.length));
            setTimeout(handleSubmit, 100);
        } else {
            handleSubmit();
        }
      }
      clearVoiceCommand();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceCommand, clearVoiceCommand, originalText]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-neutral-dark dark:text-neutral-light-accent mb-6">AI Text Simplifier</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">Paste complex text below. The AI will attempt to simplify it, making it easier to read and understand, especially for users with cognitive disabilities or reading difficulties.</p>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <TextArea 
        label="Enter text to simplify:"
        value={originalText}
        onChange={(e) => setOriginalText(e.target.value)}
        placeholder="Paste your complex text here..."
        rows={6}
      />
      
      <Button 
        onClick={handleSubmit} 
        disabled={!originalText.trim() || isLoading}
        isLoading={isLoading}
        icon="fas fa-language"
        className="w-full sm:w-auto"
      >
        Simplify Text
      </Button>

      {isLoading && <LoadingSpinner text="Simplifying text..." />}

      {result && (
        <ResultCard title="Text Simplification Results" icon="fas fa-spell-check" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-md text-secondary dark:text-secondary-light mb-1">Original Text:</h4>
              <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-sm h-48 overflow-y-auto">{result.originalText}</p>
            </div>
            <div>
              <h4 className="font-semibold text-md text-secondary dark:text-secondary-light mb-1">Simplified Text:</h4>
              <p className="bg-emerald-50 dark:bg-emerald-800/60 p-3 rounded border border-emerald-200 dark:border-emerald-700 text-sm h-48 overflow-y-auto">{result.simplifiedText}</p>
            </div>
          </div>
          {result.readingLevelImprovement && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-secondary dark:text-secondary-light">Note:</strong> {result.readingLevelImprovement}
            </p>
          )}
        </ResultCard>
      )}
    </div>
  );
};