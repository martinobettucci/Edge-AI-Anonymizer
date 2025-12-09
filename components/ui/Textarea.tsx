
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    isCode?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ className = '', isCode = false, ...props }) => {
  const fontClass = isCode ? 'font-mono text-sm' : '';
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-2 text-base text-gray-200 ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${fontClass} ${className}`}
      {...props}
    />
  );
};
