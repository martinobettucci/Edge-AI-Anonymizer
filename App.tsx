
import React, { useState, useEffect } from 'react';
import { Anonymizer } from './components/Anonymizer';
import { Deanonymizer } from './components/Deanonymizer';
import { loadModel } from './services/presidioService';
import { Wizard } from './components/Wizard';
import type { AnonymizeResult } from './types';
import { ShieldCheck, DatabaseZap, Heart, Globe } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LANGUAGES } from './locales/translations';

const AppContent: React.FC = () => {
  const [anonymizationResult, setAnonymizationResult] = useState<AnonymizeResult | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    loadModel();
    
    const hasSeenWizard = localStorage.getItem('presidio_wizard_seen');
    if (!hasSeenWizard) {
      setShowWizard(true);
    }
  }, []);

  const handleAnonymizationComplete = (result: AnonymizeResult) => {
    setAnonymizationResult(result);
  };

  const closeWizard = () => {
    localStorage.setItem('presidio_wizard_seen', 'true');
    setShowWizard(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 md:p-8">
      {showWizard && <Wizard onClose={closeWizard} />}
      
      <div className="max-w-7xl mx-auto">
        <header className="relative text-center mb-10">
          {/* Language Selector */}
          <div className="absolute top-0 right-0">
             <div className="relative inline-block text-left group z-10">
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-md transition-colors border border-gray-700">
                    <Globe className="h-4 w-4" />
                    <span className="uppercase text-sm font-semibold">{language}</span>
                </button>
                <div className="hidden group-hover:block absolute right-0 mt-0 w-40 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto z-50 border border-gray-700">
                    <div className="py-1">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={`block w-full text-left px-4 py-2 text-sm ${language === lang.code ? 'bg-cyan-900/50 text-cyan-400' : 'text-gray-300 hover:bg-gray-700'}`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>
             </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2 pt-8 sm:pt-0">
            <div className="relative">
                <ShieldCheck className="h-10 w-10 text-cyan-400" />
                <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5">
                    <DatabaseZap className="h-4 w-4 text-purple-400" />
                </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
              {t('app.title')}
            </h1>
          </div>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            {t('app.subtitle')}
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Anonymizer onAnonymizationComplete={handleAnonymizationComplete} />
          <Deanonymizer
            initialAnonymizedText={anonymizationResult?.anonymizedText || ''}
            initialKey={anonymizationResult ? JSON.stringify(anonymizationResult.placeholderMap, null, 2) : ''}
          />
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm space-y-2">
          <p>Powered by Hugging Face Transformers.js and DistilBERT Multilingual NER.</p>
          <div className="flex items-center justify-center gap-1">
             <span>{t('app.footer_powered')} <a href="https://p2enjoy.studio" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">P2Enjoy Studio</a></span>
             <span className="mx-1">•</span>
             <span className="flex items-center gap-1">{t('app.footer_built')} <Heart className="h-3 w-3 text-red-500 fill-red-500" /></span>
          </div>
          <p>&copy; {new Date().getFullYear()} {t('app.title')}. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
