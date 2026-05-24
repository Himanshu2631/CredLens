'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  MessageSquare, 
  Users, 
  Bell, 
  DollarSign, 
  Activity, 
  ShieldAlert, 
  ArrowLeft, 
  Mail, 
  Building, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import SectionWrapper from '@/components/layout/SectionWrapper';
import Container from '@/components/layout/Container';
import ContentWrapper from '@/components/layout/ContentWrapper';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/Badge';
import { createBetaRequest } from '@/lib/api';

export default function SubscriptionsPage() {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const pipelineFeatures = [
    {
      icon: MessageSquare,
      title: 'Slack Workspace Sync',
      description: 'Auto-detect active members and compare slack rosters against your subscription seats in real-time.'
    },
    {
      icon: Users,
      title: 'Google Workspace Directory Sync',
      description: 'Synchronize email registries to instantly flag inactive team members still consuming software seat licenses.'
    },
    {
      icon: ShieldAlert,
      title: 'AI Redundancy Detection',
      description: 'Automatically discover duplicate software subscriptions, overlapping features, and multiple accounts in the same tool.'
    },
    {
      icon: Bell,
      title: 'Renewal Alerts',
      description: 'Receive proactive slack notifications 14 days before auto-renewals, plan upgrades, or annual billing events.'
    },
    {
      icon: DollarSign,
      title: 'Billing Visibility Ledger',
      description: 'Consolidate multiple tool invoices into a unified billing dashboard with monthly cost trend tracking.'
    },
    {
      icon: Activity,
      title: 'Seat Utilization Analytics',
      description: 'Understand the actual engagement rate per seat to optimize plan tiers and right-size license pools.'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email || !email.trim()) {
      setErrorMsg('Please enter a valid business email.');
      return;
    }
    if (!companyName || !companyName.trim()) {
      setErrorMsg('Please enter your company name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await createBetaRequest({
        companyName: companyName.trim(),
        email: email.trim(),
        teamSize: teamSize ? Number(teamSize) : null,
        featureKey: 'subscription_hub'
      });
      setEmailSent(res.emailSent);
      setSuccess(true);
    } catch (err) {
      console.error('[Beta Request] Failed to submit form:', err);
      setErrorMsg(err.message || 'Failed to submit beta request. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="relative overflow-hidden bg-zinc-950">
      {/* Background Decorative Grid and Glow */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" 
        aria-hidden="true"
      />
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" 
        aria-hidden="true"
      />

      <SectionWrapper className="pt-16 pb-24 relative z-10">
        <Container className="max-w-5xl mx-auto space-y-12">
          
          {/* Back Button Link */}
          <div className="flex items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Auditor
            </Link>
          </div>

          {/* Hero Section */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex">
              <Badge variant="success" dot={true} className="border-emerald-500/20 bg-emerald-950/10 text-emerald-400 font-mono tracking-wider text-[10px] uppercase py-1 px-3">
                Beta Roadmap Feature
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-tight">
              SaaS Subscription Hub
            </h1>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-normal">
              Cross-reference tool plans against team seats, monitor renewal schedules, and automatically flags duplicate SaaS overhead from one unified control plane.
            </p>
          </div>

          {/* Main Content Layout */}
          <ContentWrapper cols={12} className="gap-8">
            
            {/* Left side: Future Capability Grid (Planned Roadmap) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
                  Proposed Feature Pipeline
                </h3>
                <p className="text-xs text-zinc-500 leading-normal">
                  Our development roadmap targets active integration layers to auto-evaluate licensing overhead.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pipelineFeatures.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div 
                      key={idx}
                      className="group rounded-xl border border-zinc-900 bg-zinc-950/60 p-4 space-y-3 hover:border-zinc-800 transition-all duration-200 select-none shadow-sm"
                    >
                      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 text-zinc-400 group-hover:text-emerald-400 transition-colors">
                        <Icon className="h-4.5 w-4.5 stroke-[1.75]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                          {feat.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-normal">
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Request Beta Access Card */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Product Reality Note */}
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 border-b border-border/20 pb-3">
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase">
                    Platform Expansion
                  </span>
                </div>
                
                {success ? (
                  /* Success Feedback State */
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start gap-3 bg-emerald-950/5 border border-emerald-900/20 p-4 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-zinc-200">
                          Beta Access Requested
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-normal">
                          Your request has been successfully registered in our database. {emailSent ? (
                            <>A confirmation email has been dispatched to <strong className="text-zinc-300 font-semibold">{email}</strong>.</>
                          ) : (
                            <>We will notify you at <strong className="text-zinc-300 font-semibold">{email}</strong> as soon as the next beta cohort opens.</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 bg-zinc-900/30 p-2.5 rounded border border-border/20 text-center">
                      Queue Registered: subscription_hub_cohort_1
                    </div>
                  </div>
                ) : (
                  /* Form State */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-zinc-200">
                        Join the Closed Beta
                      </h4>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        Request early access to sync your corporate workspace and track live seat redundancies.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Company Name */}
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                        <input
                          type="text"
                          placeholder="Company Name"
                          aria-label="Company Name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full bg-zinc-950/50 border border-border/80 rounded px-9 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                          required
                        />
                      </div>

                      {/* Business Email */}
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                        <input
                          type="email"
                          placeholder="Business Email"
                          aria-label="Business Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full bg-zinc-950/50 border border-border/80 rounded px-9 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                          required
                        />
                      </div>

                      {/* Team Size */}
                      <div className="relative">
                        <Users className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                        <input
                          type="number"
                          placeholder="Team Size (Optional)"
                          aria-label="Team Size (Optional)"
                          min="1"
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full bg-zinc-950/50 border border-border/80 rounded px-9 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="text-[10px] text-red-400 flex items-center gap-1.5 pt-0.5">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                        {errorMsg}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-9 text-[10px] uppercase font-mono tracking-wider cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Request Early Access'
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* Security Advisory / Value Statement */}
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 space-y-2">
                <span className="text-[10px] font-mono tracking-wider text-zinc-300 block font-semibold">
                  Secure OAuth Handshake
                </span>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed font-normal">
                  All Slack and Google Workspace connections are read-only and strictly scoped to member status and active directories. CredLens never stores communication contents or proprietary enterprise files.
                </p>
              </div>

            </div>

          </ContentWrapper>
        </Container>
      </SectionWrapper>
    </PageContainer>
  );
}
