import { createAnthropic } from '@ai-sdk/anthropic';

// Setup the provider using Vercel AI SDK + Anthropic Claude 3.5 Sonnet
export const anthropicProvider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const defaultAgentModel = anthropicProvider('claude-3-5-sonnet-latest');