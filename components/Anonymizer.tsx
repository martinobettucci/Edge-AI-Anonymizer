
import React, { useState, useEffect } from 'react';
import { anonymizeText } from '../services/presidioService';
import type { AnonymizeResult } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { ResultDisplay } from './ui/ResultDisplay';
import { ScanSearch, KeyRound, Loader2, Cpu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AnonymizerProps {
  onAnonymizationComplete: (result: AnonymizeResult) => void;
}

export const Anonymizer: React.FC<AnonymizerProps> = ({ onAnonymizationComplete }) => {
  const { t, language } = useLanguage();
  // Initialize with empty string, will update via effect when language changes
  const [originalText, setOriginalText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [result, setResult] = useState<AnonymizeResult | null>(null);

  // Update sample text when language changes, but only if user hasn't typed significantly different text
  // or if it matches a known sample text. For simplicity, we just set it if it's empty or matches previous sample.
  useEffect(() => {
     setOriginalText(t('anonymizer.sample'));
  }, [language, t]);

  const handleAnonymize = async () => {
    if (!originalText.trim()) return;
    setIsLoading(true);
    setLoadingStatus(t('anonymizer.status.init'));
    
    try {
      const anonymizationResult = await anonymizeText(originalText, (data) => {
         if (data.status === 'progress') {
             setLoadingStatus(t('anonymizer.status.loading_percent', { percent: Math.round(data.progress || 0) }));
         } else if (data.status === 'initiate') {
             setLoadingStatus(t('anonymizer.status.download'));
         } else if (data.status === 'ready') {
             setLoadingStatus(t('anonymizer.status.ready'));
         }
      });
      
      setResult(anonymizationResult);
      onAnonymizationComplete(anonymizationResult);
    } catch (error) {
      console.error("Anonymization failed:", error);
      setLoadingStatus(t('anonymizer.status.error'));
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
            <span>{t('anonymizer.title')}</span>
            <span className="text-xs font-normal text-cyan-400 flex items-center gap-1 border border-cyan-400/30 px-2 py-1 rounded bg-cyan-400/10">
                <Cpu className="h-3 w-3" /> {t('anonymizer.edge_badge')}
            </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="original-text" className="font-medium text-gray-300">
            {t('anonymizer.input_label')}
          </label>
          <Textarea
            id="original-text"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder={t('anonymizer.placeholder')}
            rows={8}
          />
        </div>

        <Button onClick={handleAnonymize} disabled={isLoading || !originalText.trim()} className="w-full">
          {isLoading ? (
            <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>{loadingStatus || t('anonymizer.processing')}</span>
            </div>
          ) : (
            <>
                <ScanSearch className="mr-2 h-4 w-4" />
                {t('anonymizer.button')}
            </>
          )}
        </Button>
        
        {result && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <ResultDisplay
              label={t('anonymizer.result_label')}
              content={result.anonymizedText}
              icon={<ScanSearch className="h-5 w-5 text-gray-400" />}
            />
            <ResultDisplay
              label={t('anonymizer.key_label')}
              content={JSON.stringify(result.placeholderMap, null, 2)}
              icon={<KeyRound className="h-5 w-5 text-gray-400" />}
              isCode
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
