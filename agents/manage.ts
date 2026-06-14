/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateText, generateObject } from 'ai';
import { defaultAgentModel } from '@/agents/config';
import { webSearchTool } from '@/agents/tools/webSearch';

interface AgentTaskInput {
  task: string;
  history: any[];
}

export async function runSupervisorAgent({ task, history }: AgentTaskInput) {
  const result = await generateText({
    model: defaultAgentModel,
    system: `You are the lead Project Supervisor. Your job is to break down tasks and coordinate specialized sub-agents. 
             Always lean on tools to gather facts before drawing a conclusion.`,
    messages: [...history, { role: 'user', content: task }],
    tools: {
      searchWeb: webSearchTool, // Expose tool to Claude
    },
    maxSteps: 5, // Allows the agentic "loop" to think, call tools, and re-evaluate up to 5 times
  });

  return {
    text: result.text,
    toolCalls: result.toolCalls,
  };
}