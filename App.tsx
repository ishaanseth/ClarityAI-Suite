
import React, { useState, useCallback, useEffect } from 'react';
import { Feature } from './types';
import { ImageAnalyzer } from './components/features/ImageAnalyzer';
import { ColorContrastChecker } from './components/features/ColorContrastChecker';
import { TextSimplifier } from './components/features/TextSimplifier';
import { VideoDescriber } from './components/features/VideoDescriber';
import { VoiceInputButton } from './components/shared/VoiceInputButton';
import { parseVoiceCommand } from './utils/voiceUtils';
import { ActionType } from './types';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>(Feature.IMAGE_ANALYZER);
  const [voiceCommand, setVoiceCommand] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      if (storedTheme) {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light'; // Default for SSR or non-browser environments
  });

  const navItems = React.useMemo(() => [
    { id: Feature.IMAGE_ANALYZER, label: 'Image Describer', icon: 'fas fa-image' },
    { id: Feature.COLOR_CONTRAST_CHECKER, label: 'Color Contrast', icon: 'fas fa-palette' },
    { id: Feature.TEXT_SIMPLIFIER, label: 'Text Simplifier', icon: 'fas fa-font' },
    { id: Feature.VIDEO_DESCRIBER, label: 'Video Describer', icon: 'fas fa-video' },
  ], []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const featureComponents: Record<Feature, React.ReactNode> = {
    [Feature.IMAGE_ANALYZER]: <ImageAnalyzer voiceCommand={voiceCommand} clearVoiceCommand={() => setVoiceCommand(null)} />,
    [Feature.COLOR_CONTRAST_CHECKER]: <ColorContrastChecker voiceCommand={voiceCommand} clearVoiceCommand={() => setVoiceCommand(null)} />,
    [Feature.TEXT_SIMPLIFIER]: <TextSimplifier voiceCommand={voiceCommand} clearVoiceCommand={() => setVoiceCommand(null)} />,
    [Feature.VIDEO_DESCRIBER]: <VideoDescriber voiceCommand={voiceCommand} clearVoiceCommand={() => setVoiceCommand(null)} />,
  };

  const handleVoiceResult = useCallback(async (transcript: string) => {
    console.log('Voice transcript:', transcript);
    const featureNavigationLabels = navItems.map(item => item.label);
    
    try {
      const commandAction = await parseVoiceCommand(transcript, activeFeature, featureNavigationLabels);
    
      if (commandAction.type === ActionType.SWITCH_FEATURE && commandAction.payload) {
          setActiveFeature(commandAction.payload as Feature);
          setVoiceCommand(null); 
      } else if (commandAction.type === ActionType.SET_INPUT && commandAction.payload) {
          setVoiceCommand(transcript); 
      } else if (commandAction.type !== ActionType.UNKNOWN) {
          setVoiceCommand(transcript); 
      } else {
          console.warn("Unknown voice command:", transcript);
          setVoiceCommand(null);
      }
    } catch (error) {
      console.error("Error processing voice command:", error);
      // Optionally, display an error to the user via an alert component
      setVoiceCommand(null);
    }
  }, [activeFeature, navItems]);


  useEffect(() => {
    // Voice command handling logic remains the same
  }, [voiceCommand]);


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-light via-blue-50 to-emerald-50 dark:from-neutral-darker dark:via-gray-900 dark:to-emerald-950 transition-colors duration-300">
      <header className="bg-primary dark:bg-primary-dark text-white shadow-lg p-4 sm:p-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <i className="fas fa-universal-access mr-2"></i>AI Web Accessibility Suite
          </h1>
          <div className="flex items-center space-x-3">
            <VoiceInputButton 
              onResult={handleVoiceResult} 
              isListening={isListening}
              setIsListening={setIsListening}
              className="bg-white text-primary hover:bg-primary-light hover:text-white dark:bg-neutral-dark-accent dark:text-primary-light dark:hover:bg-gray-600"
            />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-white text-primary hover:bg-primary-light hover:text-white dark:bg-neutral-dark-accent dark:text-primary-light dark:hover:bg-gray-600 transition-colors duration-150"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 container mx-auto mt-4 sm:mt-6 space-x-0 sm:space-x-6 flex-col sm:flex-row px-2 sm:px-0">
        <aside className="w-full sm:w-1/4 mb-4 sm:mb-0">
          {/* Ensure nav and ul can fill height */}
          <nav className="bg-white dark:bg-neutral-dark-accent p-3 rounded-xl shadow-lg flex flex-col h-full">
            <h2 className="text-xl font-semibold text-neutral-dark dark:text-neutral-light-accent mb-4 text-center sm:text-left">Tools</h2>
            {/* Make ul fill remaining space and distribute items */}
            <ul className="flex flex-col flex-grow justify-around space-y-2 sm:space-y-0">
              {navItems.map((item) => (
                <li key={item.id} className="flex"> {/* Use flex on li for button to fill height if needed */}
                  <button
                    onClick={() => setActiveFeature(item.id)}
                    className={`w-full text-left px-4 py-6 rounded-lg transition-all duration-200 ease-in-out flex items-center text-base sm:text-lg
                                ${activeFeature === item.id 
                                  ? 'bg-primary dark:bg-primary-dark text-white shadow-md transform scale-105' 
                                  : 'bg-neutral-light dark:bg-gray-700 text-neutral-dark dark:text-neutral-light-accent hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white dark:hover:text-white'}`}
                    aria-current={activeFeature === item.id ? 'page' : undefined}
                  >
                    <i className={`${item.icon} mr-3 w-6 text-center text-xl`}></i>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 bg-white dark:bg-neutral-dark-accent p-4 sm:p-8 rounded-xl shadow-lg">
          {featureComponents[activeFeature]}
        </main>
      </div>

      <footer className="bg-neutral-dark dark:bg-black text-neutral-light dark:text-gray-400 text-center p-4 sm:p-6 mt-6">
        <p>&copy; {new Date().getFullYear()} Access for All. Empowering inclusive web experiences.</p>
      </footer>
    </div>
  );
};

export default App;
