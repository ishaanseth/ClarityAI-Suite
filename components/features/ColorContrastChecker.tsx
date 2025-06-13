
import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ResultCard } from '../shared/ResultCard';
import { Alert } from '../shared/Alert';
import { analyzeColorContrast } from '../../services/geminiService';
import { ColorContrastAnalysis, ApiError, BaseFeatureProps, ActionType } from '../../types';

const isValidHexColor = (color: string): boolean => /^#([0-9A-F]{3}){1,2}$/i.test(color);

export const ColorContrastChecker: React.FC<BaseFeatureProps> = ({ voiceCommand, clearVoiceCommand }) => {
  const [foregroundColor, setForegroundColor] = useState<string>("#000000");
  const [backgroundColor, setBackgroundColor] = useState<string>("#FFFFFF");
  const [result, setResult] = useState<ColorContrastAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fgError, setFgError] = useState<string>("");
  const [bgError, setBgError] = useState<string>("");

  const handleColorChange = (setter: React.Dispatch<React.SetStateAction<string>>, errorSetter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (value && !isValidHexColor(value)) {
      errorSetter("Invalid HEX color (e.g., #RRGGBB or #RGB)");
    } else {
      errorSetter("");
    }
  };
  
  const handleSubmit = async () => {
    setError(null);
    if (!isValidHexColor(foregroundColor)) {
      setFgError("Invalid foreground HEX color.");
      return;
    }
    if (!isValidHexColor(backgroundColor)) {
      setBgError("Invalid background HEX color.");
      return;
    }
    setFgError("");
    setBgError("");

    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await analyzeColorContrast(foregroundColor, backgroundColor);
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
      if (lowerCmd.includes(ActionType.SUBMIT_COLORS.replace('_', ' ').toLowerCase()) || lowerCmd.includes('check contrast')) {
         const parts = lowerCmd.split(/\s+(?:on|with|and)\s+/);
         if (parts.length === 2) {
            const color1Match = parts[0].match(/#([0-9a-f]{3,6})\b/);
            const color2Match = parts[1].match(/#([0-9a-f]{3,6})\b/);
            const namedColors: Record<string, string> = { black: '#000000', white: '#FFFFFF', red: '#FF0000', green: '#00FF00', blue: '#0000FF' };
            
            let c1 = color1Match ? `#${color1Match[1]}` : namedColors[parts[0].replace("check contrast", "").trim()];
            let c2 = color2Match ? `#${color2Match[1]}` : namedColors[parts[1].trim()];

            if (c1 && isValidHexColor(c1.toUpperCase())) setForegroundColor(c1.toUpperCase());
            if (c2 && isValidHexColor(c2.toUpperCase())) setBackgroundColor(c2.toUpperCase());
            
            if ((c1 && isValidHexColor(c1)) && (c2 && isValidHexColor(c2))) {
                setTimeout(handleSubmit, 100);
            } else {
                setError("Could not parse colors from voice command. Please use HEX codes or simple color names like 'black', 'white'.");
            }
         } else {
             handleSubmit(); 
         }
      }
      clearVoiceCommand();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceCommand, clearVoiceCommand, foregroundColor, backgroundColor]);


  const ContrastLevel: React.FC<{ label: string; achieved: boolean }> = ({ label, achieved }) => (
    <div className={`flex items-center p-2 rounded 
                    ${achieved 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
      <i className={`fas ${achieved ? 'fa-check-circle' : 'fa-times-circle'} mr-2 ${achieved ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}></i>
      {label}: {achieved ? 'Pass' : 'Fail'}
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold text-neutral-dark dark:text-neutral-light-accent mb-6">AI Color Contrast Advisor</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">Enter foreground and background colors (HEX format) to check their contrast ratio against WCAG guidelines. AI will provide feedback and suggest accessible alternatives if needed.</p>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Input 
          label="Foreground Color (e.g., #000000)" 
          type="text" 
          value={foregroundColor} 
          onChange={(e) => handleColorChange(setForegroundColor, setFgError, e.target.value.toUpperCase())}
          icon="fas fa-paint-brush"
          error={fgError}
          maxLength={7}
          className="uppercase"
        />
        <Input 
          label="Background Color (e.g., #FFFFFF)" 
          type="text" 
          value={backgroundColor} 
          onChange={(e) => handleColorChange(setBackgroundColor, setBgError, e.target.value.toUpperCase())}
          icon="fas fa-fill-drip"
          error={bgError}
          maxLength={7}
          className="uppercase"
        />
      </div>
      <div className="flex items-center mb-6 space-x-2">
          <span className="text-sm text-neutral-dark dark:text-neutral-light-accent">Preview:</span>
          <div 
            style={{ 
              backgroundColor: isValidHexColor(backgroundColor) ? backgroundColor : '#FFFFFF', 
              color: isValidHexColor(foregroundColor) ? foregroundColor : '#000000', 
              border: `1px solid ${isValidHexColor(foregroundColor) ? foregroundColor : '#cccccc'}` 
            }} 
            className="px-4 py-2 rounded"
          >
            Sample Text
          </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={isLoading || !!fgError || !!bgError || !isValidHexColor(foregroundColor) || !isValidHexColor(backgroundColor)}
        isLoading={isLoading}
        icon="fas fa-magnifying-glass-chart"
        className="w-full sm:w-auto"
      >
        Analyze Contrast
      </Button>

      {isLoading && <LoadingSpinner text="Analyzing colors..." />}

      {result && (
        <ResultCard title="Contrast Analysis" icon="fas fa-tachometer-alt" className="mt-6">
          <p className="mb-2"><strong className="text-secondary dark:text-secondary-light">Overall Feedback:</strong> {result.feedback}</p>
          {typeof result.ratio === 'number' && <p className="mb-2"><strong className="text-secondary dark:text-secondary-light">Contrast Ratio:</strong> {result.ratio.toFixed(2)}:1</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
            <ContrastLevel label="WCAG AA (Small Text)" achieved={result.wcagAaSmallText} />
            <ContrastLevel label="WCAG AA (Large Text)" achieved={result.wcagAaLargeText} />
            <ContrastLevel label="WCAG AAA (Small Text)" achieved={result.wcagAaaSmallText} />
            <ContrastLevel label="WCAG AAA (Large Text)" achieved={result.wcagAaaLargeText} />
          </div>

          {result.suggestions && result.suggestions.length > 0 && (
            <>
              <h4 className="font-semibold text-md text-secondary dark:text-secondary-light mt-4">AI Suggestions for Better Contrast:</h4>
              {result.suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 my-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                  <p><strong>Option {index + 1}:</strong></p>
                  <div className="flex items-center space-x-4 my-1">
                    <span className="font-mono">FG: {suggestion.foregroundColor}</span>
                    <span className="font-mono">BG: {suggestion.backgroundColor}</span>
                    <div 
                      style={{ 
                        backgroundColor: suggestion.backgroundColor, 
                        color: suggestion.foregroundColor, 
                        border: '1px solid #ccc' 
                      }} 
                      className="px-3 py-1 rounded text-sm"
                    >
                        Preview
                    </div>
                  </div>
                  {suggestion.notes && <p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.notes}</p>}
                </div>
              ))}
            </>
          )}
        </ResultCard>
      )}
    </div>
  );
};