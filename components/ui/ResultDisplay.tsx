
import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface ResultDisplayProps {
  label: string;
  content: string;
  icon: React.ReactNode;
  isCode?: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ label, content, icon, isCode = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const preClasses = isCode 
    ? "font-mono bg-gray-900/70 p-4 rounded-md text-cyan-300 text-sm" 
    : "whitespace-pre-wrap bg-gray-900/70 p-4 rounded-md text-gray-200";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-gray-300">{label}</h3>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="h-5 w-5 text-green-400" /> : <Clipboard className="h-5 w-5" />}
        </button>
      </div>
      <div className="relative">
        <pre className={preClasses}>
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
};
