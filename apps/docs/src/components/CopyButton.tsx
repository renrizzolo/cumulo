'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@cumulo/core';

export interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  }, [text]);

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleCopy}
      aria-label="Copy code snippet"
      className={className}
    >
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  );
}
