'use client';

import React from 'react';
import { KeyRound } from 'lucide-react';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default function ApiKeysPage() {
  const features = [
    'Volumetric key monitoring with caching efficiency metrics for LLM providers.',
    'Context window budget guards to detect bloated prompts and prevent unexpected bills.',
    'Automated key rotation schedules and unified gateway credential proxying.'
  ];

  return (
    <PlaceholderPage
      title="AI API Key Manager"
      description="Track secure API tokens, log detailed token caching volumes, and establish hard budget limiters for key generative models."
      icon={KeyRound}
      features={features}
    />
  );
}
