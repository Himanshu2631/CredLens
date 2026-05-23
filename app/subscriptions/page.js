'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default function SubscriptionsPage() {
  const features = [
    'Direct workspace integrations with Slack & Google Workspace to sync team seats.',
    'Plan tier verification triggers to alert you before auto-renewals or major tier upgrades.',
    'Intelligent cross-provider redundancy alerts to flag duplicate subscriptions instantly.'
  ];

  return (
    <PlaceholderPage
      title="SaaS Subscription Hub"
      description="Manage active workspace licenses, cross-reference tool plans against team seats, and eliminate duplicate subscription overhead."
      icon={CreditCard}
      features={features}
    />
  );
}
