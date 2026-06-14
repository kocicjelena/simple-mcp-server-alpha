import { tool } from 'ai';
import { z } from 'zod';

// Strictly typed tool that Claude can understand and invoke
export const webSearchTool = tool({
  description: 'Searches the web for up-to-date documentation or news.',
  parameters: z.shape({
    query: z.string().describe('The search terms to look up'),
  }),
  execute: async ({ query }) => {
    // Implement your server-side API call here (e.g., Tavily, Serper, Exa)
    const response = await fetch(`https://tavily.com`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    return response.json();
  },
});