import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useCopyToClipboard = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = useCallback(async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      
      toast({
        title: "Copied!",
        description: `${label || 'Text'} copied to clipboard`,
        duration: 2000,
      });

      // Clear the copied text after 2 seconds
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  }, [toast]);

  return { copyToClipboard, copiedText };
};