
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Shield, Lock, Send, RefreshCw, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WizardProps {
  onClose: () => void;
}

export const Wizard: React.FC<WizardProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: t('wizard.step0.title'),
      description: t('wizard.step0.desc'),
      icon: <Shield className="w-16 h-16 text-cyan-400 mb-4" />
    },
    {
      title: t('wizard.step1.title'),
      description: t('wizard.step1.desc'),
      icon: <Lock className="w-16 h-16 text-cyan-400 mb-4" />
    },
    {
      title: t('wizard.step2.title'),
      description: t('wizard.step2.desc'),
      icon: <Send className="w-16 h-16 text-cyan-400 mb-4" />
    },
    {
      title: t('wizard.step3.title'),
      description: t('wizard.step3.desc'),
      icon: <RefreshCw className="w-16 h-16 text-cyan-400 mb-4" />
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg">
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors"
          aria-label={t('wizard.skip')}
        >
          <X className="w-8 h-8" />
        </button>
        
        <Card className="border-cyan-500/30 bg-gray-900 shadow-2xl overflow-hidden">
            {/* Progress Bar */}
            <div className="h-1 w-full bg-gray-800">
                <div 
                    className="h-full bg-cyan-500 transition-all duration-300 ease-in-out"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
            </div>
            
          <CardContent className="pt-10 pb-8 px-8 text-center min-h-[320px] flex flex-col items-center justify-center">
            <div className="bg-cyan-500/10 p-6 rounded-full mb-6 ring-1 ring-cyan-500/30">
                {steps[step].icon}
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {steps[step].title}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {steps[step].description}
            </p>
          </CardContent>

          <div className="p-6 bg-gray-800/50 border-t border-gray-700 flex justify-between items-center">
            <div className="flex gap-1">
                {steps.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-2 w-2 rounded-full transition-colors ${i === step ? 'bg-cyan-400' : 'bg-gray-600'}`}
                    />
                ))}
            </div>
            <Button onClick={handleNext} className="group">
              {step === steps.length - 1 ? t('wizard.start') : t('wizard.next')}
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
