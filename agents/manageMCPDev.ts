/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateText } from 'ai';
import { defaultAgentModel } from './config';
import { getNextDevTools } from './mcpClientDev';

export async function handleDiagnosticsAgent(userPrompt: string) {
  const mcpClient = await getNextDevTools();
  
  // Fetch lists of tools exposed by next-devtools-mcp
  const { tools: mcpTools } = await mcpClient.listTools();

  // Convert MCP schema into standard executable AI SDK tools
  const mappedTools: Record<string, any> = {};

  for (const tool of mcpTools) {
    mappedTools[tool.name] = {
      description: tool.description,
      parameters: tool.inputSchema, // Direct map of JSON-Schema
      execute: async (args: any) => {
        // Direct call to execution bridge
        const result = await mcpClient.callTool({
          name: tool.name,
          arguments: args,
        });
        return result.content;
      },
    };
  }

  // Execute the agentic loop with Claude
  const response = await generateText({
    model: defaultAgentModel,
    system: `You are an expert Next.js full-stack debugger. You have real-time access to the local development environment via tools. 
             If the user asks about errors, warnings, or logs, execute the corresponding tools immediately to diagnose the state.`,
    messages: [{ role: 'user', content: userPrompt }],
    tools: mappedTools,
    maxSteps: 3, // Allow loop step to call tool -> get error trace -> reply
  });

  return response.text;
}
