import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Cpu, Layers, Sparkles, Database, Zap, Code, Image, MessageSquare, Check } from 'lucide-react';
import FormField from './FormField';
import { cn } from '@/lib/utils';

// Predefined AI tools for selection
const AI_TOOLS = [
  { id: 'openai', name: 'OpenAI API', desc: 'GPT-4o, DALL-E, Embeddings', icon: Cpu, color: 'text-emerald-400' },
  { id: 'anthropic', name: 'Anthropic Claude', desc: 'Claude 3.5, XML parsing', icon: Layers, color: 'text-orange-400' },
  { id: 'gemini', name: 'Google Gemini', desc: 'Large contexts, Flash 1.5', icon: Sparkles, color: 'text-sky-400' },
  { id: 'pinecone', name: 'Pinecone Db', desc: 'High-scale vector queries', icon: Database, color: 'text-emerald-500' },
  { id: 'cohere', name: 'Cohere API', desc: 'Command R+, custom Rerank', icon: Zap, color: 'text-purple-400' },
  { id: 'vercel', name: 'Vercel AI SDK', desc: 'RSC streams, unified wrapper', icon: Code, color: 'text-white' },
  { id: 'midjourney', name: 'Midjourney / Stability', desc: 'Creative asset generation', icon: Image, color: 'text-pink-400' },
  { id: 'perplexity', name: 'Perplexity Search', desc: 'Real-time citation engines', icon: MessageSquare, color: 'text-teal-400' }
];

export default function ToolSelection() {
  const { watch, setValue, formState: { errors } } = useFormContext();
  
  // Watch the selected tools array (fallback to empty array)
  const selectedTools = watch('tools') || [];

  const handleToggleTool = (toolId) => {
    let updatedTools;
    if (selectedTools.includes(toolId)) {
      updatedTools = selectedTools.filter(id => id !== toolId);
    } else {
      updatedTools = [...selectedTools, toolId];
    }
    // Update react-hook-form state
    setValue('tools', updatedTools, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true 
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
      <FormField
        label="Select AI Stack Component"
        description="Choose the systems, models, and endpoints you use in your product's architecture. We'll audit these for redundancy, token bloating, and tier caching."
        error={errors.tools}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {AI_TOOLS.map((tool) => {
            const isSelected = selectedTools.includes(tool.id);
            const Icon = tool.icon;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToggleTool(tool.id)}
                className={cn(
                  "relative flex items-start text-left p-3.5 rounded-lg border transition-all duration-150 group cursor-pointer select-none",
                  isSelected
                    ? "bg-zinc-900 border-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.06)]"
                    : "bg-zinc-950/40 border-border/60 hover:bg-zinc-950 hover:border-zinc-800"
                )}
              >
                {/* Selected Indicator Badge */}
                <div
                  className={cn(
                    "absolute top-3 right-3 flex items-center justify-center h-4 w-4 rounded-full border transition-all duration-150",
                    isSelected
                      ? "bg-white border-white text-black"
                      : "bg-transparent border-zinc-800 text-transparent opacity-0 group-hover:opacity-40"
                  )}
                >
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>

                {/* Left Side: Icon Container */}
                <div className={cn(
                  "mr-3 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background transition-colors",
                  isSelected ? "bg-zinc-950 border-zinc-700" : "bg-transparent border-border/40"
                )}>
                  <Icon className={cn("h-4 w-4", tool.color)} />
                </div>

                {/* Right Side: Copy Details */}
                <div className="space-y-0.5 pr-4">
                  <h4 className={cn(
                    "text-xs font-semibold transition-colors duration-100",
                    isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"
                  )}>
                    {tool.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground leading-normal font-normal">
                    {tool.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </FormField>
    </div>
  );
}
