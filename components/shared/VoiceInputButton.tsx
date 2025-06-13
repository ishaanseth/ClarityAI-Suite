
import React, { useEffect, useRef } from 'react';
import { Button } from './Button';

interface VoiceInputButtonProps {
  onResult: (transcript: string) => void;
  isListening: boolean;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}

// Attempt to get the SpeechRecognition type safely
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
// Fix: Use 'any' as SpeechRecognition instance type is not globally defined or properly recognized.
let recognition: any | null = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
} else {
  console.warn("Speech Recognition API not supported in this browser.");
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onResult, isListening, setIsListening, className }) => {
  // Fix: Use 'any' for useRef type argument as SpeechRecognition instance type is not globally defined or properly recognized.
  const recognitionRef = useRef<any | null>(recognition);

  useEffect(() => {
    const currentRecognition = recognitionRef.current;
    if (!currentRecognition) return;

    // Fix: Use 'any' as SpeechRecognitionEvent type is not globally defined.
    const handleResult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      onResult(transcript);
      setIsListening(false);
    };

    // Fix: Use 'any' as SpeechRecognitionErrorEvent type is not globally defined.
    const handleError = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      // Optionally, inform the user about the error
    };

    const handleEnd = () => {
      setIsListening(false);
    };

    currentRecognition.addEventListener('result', handleResult);
    currentRecognition.addEventListener('error', handleError);
    currentRecognition.addEventListener('end', handleEnd);

    return () => {
      currentRecognition.removeEventListener('result', handleResult);
      currentRecognition.removeEventListener('error', handleError);
      currentRecognition.removeEventListener('end', handleEnd);
    };
  }, [onResult, setIsListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Sorry, your browser doesn't support voice input.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Handle cases like microphone permission denied previously
        console.error("Could not start speech recognition:", e);
        setIsListening(false);
        alert("Could not start voice input. Please check microphone permissions.");
      }
    }
  };

  if (!SpeechRecognition) {
    return <Button disabled className={className} title="Voice input not supported"> <i className="fas fa-microphone-slash"></i> </Button>;
  }

  return (
    <Button 
      onClick={toggleListening} 
      variant={isListening ? "danger" : "primary"}
      className={`${isListening ? 'animate-pulse' : ''} ${className}`}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      <i className={`fas ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
      <span className="sr-only">{isListening ? 'Stop Listening' : 'Start Voice Command'}</span>
    </Button>
  );
};
