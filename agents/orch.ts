/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateObject } from 'ai';
import { z } from 'zod';
import { defaultAgentModel } from './config';
import { getNextDevTools } from './mcpClientDev';

// Define the structure for the proposed patch
const PatchProposalSchema = z.object({
  hasError: z.boolean().describe('True if an error was found and a fix is available.'),
  filePath: z.string().describe('The file path to patch (e.g., src/components/ProductList.tsx)'),
  explanation: z.string().describe('Clear explanation of what caused the bug and how this code resolves it.'),
  originalCode: z.string().describe('The exact current broken code block to be replaced.'),
  patchedCode: z.string().describe('The new fixed code block to swap in.')
});

export async function proposeApplicationPatch() {
  const mcpClient = await getNextDevTools();
  const { tools: mcpTools } = await mcpClient.listTools();

  // Extract tools from next-devtools-mcp
  const runtimeTools: Record<string, any> = {};
  for (const tool of mcpTools) {
    runtimeTools[tool.name] = {
      description: tool.description,
      parameters: tool.inputSchema,
      execute: async (args: any) => {
        const result = await mcpClient.callTool({ name: tool.name, arguments: args });
        return result.content;
      },
    };
  }

  // Execute Claude loop to discover bugs and output a structured fix proposal
  const response = await generateObject({
    model: defaultAgentModel,
    schema: PatchProposalSchema,
    system: `You are a diagnostic software agent. Run diagnostics tools to check for active app errors.
             If errors exist, extract the exact file source code block and design a surgical fix.
             Do not alter code directly on disk. Output the proposed text replacement structural data fields.`,
    messages: [{ role: 'user', content: 'Scan the running application logs and prepare an error patch.' }],
    tools: runtimeTools,
    maxSteps: 5,
  });

  return response.object;
}
