/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateObject } from 'ai';
import { z } from 'zod';
import { defaultAgentModel } from './config';
import { getNextDevTools } from './mcpClientDev';

const PatchProposalSchema = z.object({
  hasError: z.boolean(),
  filePath: z.string(),
  explanation: z.string(),
  originalCode: z.string(),
  patchedCode: z.string()
});

interface DiagnosticRunArgs {
  feedback?: string;      // The developer's reason for rejecting the patch
  previousCode?: string;   // The failed code block Claude outputted prior
}

export async function proposeApplicationPatch({ feedback, previousCode }: DiagnosticRunArgs = {}) {
  const mcpClient = await getNextDevTools();
  const { tools: mcpTools } = await mcpClient.listTools();

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

  // Construct dynamic prompt tracking historical conversational context
  const messages: any[] = [
    { role: 'user', content: 'Scan the running application logs and prepare an error patch.' }
  ];

  if (feedback && previousCode) {
    messages.push(
      { role: 'assistant', content: `Proposed fix option: ${previousCode}` },
      { role: 'user', content: `That patch was REJECTED by the developer with the following feedback: "${feedback}". Please inspect alternative diagnostics or fix methodologies.` }
    );
  }

  const response = await generateObject({
    model: defaultAgentModel,
    schema: PatchProposalSchema,
    system: `You are a diagnostic software agent. Run application tools to check for errors.
             If requested to iterate, avoid matching previous failed code attempts. 
             Incorporate developer feedback stringently to build an alternative structure.`,
    messages,
    tools: runtimeTools,
    maxSteps: 5,
  });

  return response.object;
}
