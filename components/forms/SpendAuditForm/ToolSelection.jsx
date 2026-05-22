import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Cpu, Layers, Sparkles, Database, Zap, Code, Bot, MessageSquare, Check } from 'lucide-react';
import FormField from './FormField';
import { cn } from '@/lib/utils';

// AI tools list with specific plans, descriptions, icons, and colors
const AI_TOOLS = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    desc: 'Copilot chat, writing and data analysis models',
    icon: Bot,
    color: 'text-emerald-400',
    plans: [
      { id: 'plus', name: 'Plus ($20/mo)' },
      { id: 'team', name: 'Team ($30/mo/seat)' },
      { id: 'enterprise', name: 'Enterprise (Custom)' }
    ]
  },
  {
    id: 'claude',
    name: 'Claude',
    desc: 'Artifacts, writing, and code assistant Pro space',
    icon: Layers,
    color: 'text-orange-400',
    plans: [
      { id: 'pro', name: 'Pro ($20/mo)' },
      { id: 'team', name: 'Team ($30/mo/seat)' }
    ]
  },
  {
    id: 'cursor',
    name: 'Cursor',
    desc: 'Sleek agentic AI-powered IDE editor',
    icon: Code,
    color: 'text-sky-400',
    plans: [
      { id: 'pro', name: 'Pro ($20/mo)' },
      { id: 'business', name: 'Business ($40/mo/seat)' }
    ]
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    desc: 'Autocomplete & inline terminal suggestions',
    icon: Cpu,
    color: 'text-zinc-300',
    plans: [
      { id: 'individual', name: 'Individual ($10/mo)' },
      { id: 'business', name: 'Business ($19/mo/seat)' },
      { id: 'enterprise', name: 'Enterprise ($39/mo/seat)' }
    ]
  },
  {
    id: 'gemini',
    name: 'Gemini Workspace',
    desc: 'Google Suite integrated AI and chatbot',
    icon: Sparkles,
    color: 'text-sky-400',
    plans: [
      { id: 'advanced', name: 'Advanced ($20/mo)' },
      { id: 'business', name: 'Business ($30/mo/seat)' },
      { id: 'enterprise', name: 'Enterprise (Custom)' }
    ]
  },
  {
    id: 'openai_api',
    name: 'OpenAI API',
    desc: 'Raw tokens and endpoints console access',
    icon: Zap,
    color: 'text-emerald-500',
    plans: [
      { id: 'pay_as_you_go', name: 'Pay-as-you-go' },
      { id: 'tier_grant', name: 'Tier 1-5 Prepaid Grant' }
    ]
  },
  {
    id: 'anthropic_api',
    name: 'Anthropic API',
    desc: 'High-throughput LLM model endpoints keys',
    icon: Database,
    color: 'text-orange-500',
    plans: [
      { id: 'pay_as_you_go', name: 'Pay-as-you-go' },
      { id: 'scale', name: 'Scale Tier rate-limits' }
    ]
  },
  {
    id: 'v0_dev',
    name: 'v0.dev',
    desc: 'Interactive UI code and template generation',
    icon: MessageSquare,
    color: 'text-teal-400',
    plans: [
      { id: 'free', name: 'Free Tier' },
      { id: 'premium', name: 'Premium ($20/mo)' },
      { id: 'enterprise', name: 'Enterprise (Custom)' }
    ]
  }
];

export default function ToolSelection() {
  const { watch, setValue, formState: { errors } } = useFormContext();
  
  const selectedTools = watch('tools') || [];
  const toolPlans = watch('toolPlans') || {};

  const handleToggleTool = (toolId, defaultPlanId) => {
    let updatedTools;
    const currentPlans = { ...toolPlans };

    if (selectedTools.includes(toolId)) {
      // Remove tool and clean up its plan key
      updatedTools = selectedTools.filter(id => id !== toolId);
      delete currentPlans[toolId];
    } else {
      // Add tool and assign its default plan
      updatedTools = [...selectedTools, toolId];
      currentPlans[toolId] = defaultPlanId;
    }

    setValue('tools', updatedTools, { shouldValidate: true, shouldDirty: true });
    setValue('toolPlans', currentPlans, { shouldValidate: true, shouldDirty: true });
  };

  const handlePlanChange = (toolId, planId) => {
    const currentPlans = { ...toolPlans };
    currentPlans[toolId] = planId;
    setValue('toolPlans', currentPlans, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
      <FormField
        label="Select AI Tools in Use"
        description="Choose the subscriptions and API access points in your current workflow. We'll identify seat redundancy and token optimization opportunities."
        error={errors.tools}
      >
        <div
          role="group"
          aria-label="Select AI Tools in Use"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2"
        >
          {AI_TOOLS.map((tool) => {
            const isSelected = selectedTools.includes(tool.id);
            const selectedPlan = toolPlans[tool.id];
            const Icon = tool.icon;
            const defaultPlanId = tool.plans[0].id;

            return (
              <div
                key={tool.id}
                className={cn(
                  "relative flex flex-col justify-between w-full p-3.5 rounded-lg border transition-all duration-200 group",
                  isSelected
                    ? "bg-zinc-900 border-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.06)]"
                    : errors.tools
                    ? "bg-zinc-950/20 border-red-500/25 hover:border-red-500/40"
                    : "bg-zinc-950/40 border-border/60 hover:border-zinc-800"
                )}
              >
                {/* Button to toggle selection */}
                <button
                  type="button"
                  onClick={() => handleToggleTool(tool.id, defaultPlanId)}
                  aria-pressed={isSelected}
                  className="flex items-start text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-md cursor-pointer"
                >
                  {/* Card Main Info */}
                  <div className="flex items-start w-full pr-6">
                    <div className={cn(
                      "mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background transition-colors",
                      isSelected ? "bg-zinc-950 border-zinc-700" : "bg-transparent border-border/40"
                    )}>
                      <Icon className={cn("h-4 w-4", tool.color)} />
                    </div>

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h4 className={cn(
                        "text-xs font-semibold transition-colors duration-100",
                        isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"
                      )}>
                        {tool.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-normal font-normal break-words">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  {/* Visual Checkmark Badge */}
                  <div
                    className={cn(
                      "absolute top-3.5 right-3.5 flex items-center justify-center h-4 w-4 rounded-full border transition-all duration-150",
                      isSelected
                        ? "bg-white border-white text-black"
                        : "bg-transparent border-zinc-800 text-transparent opacity-0 group-hover:opacity-40"
                    )}
                  >
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                </button>

                {/* Conditional Dropdown Section */}
                {isSelected && (
                  <div className="mt-3.5 pt-3 border-t border-zinc-800/80 w-full animate-in fade-in slide-in-from-top-1.5 duration-200">
                    <label
                      htmlFor={`plan-select-${tool.id}`}
                      className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1"
                    >
                      Pricing Plan / Tier
                    </label>
                    <div className="relative">
                      <select
                        id={`plan-select-${tool.id}`}
                        value={selectedPlan || ''}
                        onChange={(e) => handlePlanChange(tool.id, e.target.value)}
                        className="w-full appearance-none rounded-md border border-zinc-800/80 bg-zinc-950 px-2.5 py-1.5 text-[11px] text-zinc-300 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 cursor-pointer"
                      >
                        {tool.plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {/* Custom dropdown caret indicator */}
                      <span className="absolute inset-y-0 right-2 flex items-center pr-1 pointer-events-none text-zinc-500 text-[10px]">
                        ▼
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </FormField>
    </div>
  );
}
