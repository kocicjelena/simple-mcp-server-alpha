/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateText } from 'ai';
import { defaultAgentModel } from './config';
//import { getNextDevTools } from './mcpClient';
import { fileEditorTool } from './tools/fileEditor'; // Import our new tool
import { getNextDevTools } from './mcpClientDev';

export async function runSelfHealingAgent(userPrompt: string) {
  const mcpClient = await getNextDevTools();
  const { tools: mcpTools } = await mcpClient.listTools();

  const toolRegistry: Record<string, any> = {
    // 1. Register our native filesystem tool
    patchProjectFile: fileEditorTool,
  };

  // 2. Register MCP tools dynamically (Next DevTools)
  for (const tool of mcpTools) {
    toolRegistry[tool.name] = {
      description: tool.description,
      parameters: tool.inputSchema,
      execute: async (args: any) => {
        const result = await mcpClient.callTool({ name: tool.name, arguments: args });
        return result.content;
      },
    };
  }

  // 3. Execute agent loop with an explicit sequence instructions
  const response = await generateText({
    model: defaultAgentModel,
    system: `You are an automated self-healing engineering agent for Next.js.
             Your objective is to locate app errors and patch them immediately.
             
             CRITICAL AGENT WORKFLOW:
             1. Execute diagnostics tools to extract the active error and file traces.
             2. Locate the broken code block specified by the stack trace.
             3. Use 'patchProjectFile' to fix the code pattern cleanly.
             4. Call the diagnostics tool ONE MORE TIME to verify your patch resolved the bug.
             5. Explain to the developer exactly what you fixed.`,
    messages: [{ role: 'user', content: userPrompt }],
    tools: toolRegistry,
    maxSteps: 8, // Extended execution steps to handle multi-tool cycles
  });

  return response.text;
}
