/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

export const fileEditorTool = tool({
  description: 'Patches a specific file in the project by replacing a targeted block of code with new code.',
  parameters: z.object({
    relativeFilePath: z.string().describe('The project path to the file (e.g., "src/components/ProductList.tsx")'),
    targetCodeBlock: z.string().describe('The exact string or block of code that needs to be replaced. Copy it verbatim.'),
    replacementCodeBlock: z.string().describe('The fixed, updated code block to put in place of the target code block.')
  }),
  execute: async ({ relativeFilePath, targetCodeBlock, replacementCodeBlock }) => {
    try {
      // 1. Establish full absolute path and enforce workspace boundaries
      const absolutePath = path.resolve(process.cwd(), relativeFilePath);
      if (!absolutePath.startsWith(process.cwd())) {
        return { success: false, error: 'Access denied: Target path is outside the workspace directory.' };
      }

      // 2. Read the existing file content
      const fileContent = await fs.readFile(absolutePath, 'utf-8');

      // 3. Verify the target code block exists
      if (!fileContent.includes(targetCodeBlock)) {
        return { 
          success: false, 
          error: `Could not find the target code block inside ${relativeFilePath}. Ensure spacing and characters match exactly.` 
        };
      }

      // 4. Perform the string replacement patch
      const updatedContent = fileContent.replace(targetCodeBlock, replacementCodeBlock);
      
      // 5. Save the patched content back to disk
      await fs.writeFile(absolutePath, updatedContent, 'utf-8');

      return { 
        success: true, 
        message: `Successfully patched ${relativeFilePath}. Next.js Fast Refresh will recompile automatically.` 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
});
