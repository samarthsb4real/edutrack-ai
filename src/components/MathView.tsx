'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export function MathView({
  formula,
  displayMode = true,
  className = '',
}: MathViewProps) {
  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode,
        strict: false,
      });
    } catch (err) {
      console.error('KaTeX typesetting error:', err);
      return null;
    }
  }, [formula, displayMode]);

  if (!renderedHtml) {
    return (
      <code className={`font-mono text-xs text-zinc-700 dark:text-zinc-300 ${className}`}>
        {formula}
      </code>
    );
  }

  return (
    <div
      className={`math-rendered overflow-x-auto py-1 px-2 text-center select-all ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
