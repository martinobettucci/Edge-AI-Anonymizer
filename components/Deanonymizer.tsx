
import React, { useState, useEffect } from 'react';
import { deanonymizeText } from '../services/presidioService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { ResultDisplay } from './ui/ResultDisplay';
import { History, FileText, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DeanonymizerProps {
  initialAnonymizedText: string;
  initialKey: string;
}

export const Deanonymizer: React.FC<DeanonymizerProps> = ({ initialAnonymizedText, initialKey }) => {
  const { t } = useLanguage();
  const [anonymizedText, setAnonymizedText] = useState<string>('');
  const [placeholderKey, setPlaceholderKey] = useState<string>('');
  const [restoredText, setRestoredText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setAnonymizedText(initialAnonymizedText);
    setPlaceholderKey(initialKey);
    setRestoredText(''); // Clear previous results when new data comes in
    setError('');
  }, [initialAnonymizedText, initialKey]);

  const handleRestore = async () => {
    if (!anonymizedText.trim() || !placeholderKey.trim()) return;
    
    setIsLoading(true);
    setError('');
    setRestoredText('');

    try {
      const placeholderMap = JSON.parse(placeholderKey);
      const result = await deanonymizeText(anonymizedText, placeholderMap);
      setRestoredText(result);
    } catch (e) {
      setError(t('deanonymizer.error_json'));
      console.error("Deanonymization failed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('deanonymizer.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="anonymized-text" className="font-medium text-gray-300">
            {t('deanonymizer.input_label')}
          </label>
          <Textarea
            id="anonymized-text"
            value={anonymizedText}
            onChange={(e) => setAnonymizedText(e.target.value)}
            placeholder={t('deanonymizer.input_placeholder')}
            rows={8}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="placeholder-key" className="font-medium text-gray-300">
            {t('deanonymizer.key_label')}
          </label>
          <Textarea
            id="placeholder-key"
            value={placeholderKey}
            onChange={(e) => setPlaceholderKey(e.target.value)}
            placeholder={t('deanonymizer.key_placeholder')}
            rows={8}
            isCode
          />
        </div>
        
        <Button onClick={handleRestore} disabled={isLoading || !anonymizedText.trim() || !placeholderKey.trim()} className="w-full">
           {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <History className="mr-2 h-4 w-4" />
          )}
          {t('deanonymizer.button')}
        </Button>
        
        {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm">
                {error}
            </div>
        )}

        {restoredText && (
          <div className="pt-4 border-t border-gray-700">
            <ResultDisplay
              label={t('deanonymizer.result_label')}
              content={restoredText}
              icon={<FileText className="h-5 w-5 text-gray-400" />}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
