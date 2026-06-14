/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import fs from 'fs/promises';
import path from 'path';

interface CommitPatchArgs {
  filePath: string;
  originalCode: string;
  patchedCode: string;
}

export async function commitPatchAction({ filePath, originalCode, patchedCode }: CommitPatchArgs) {
  // Prevent this action from executing outside development environments
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Patching files is restricted to local development environments.');
  }

  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    
    // Safety check: Prevent directory traversal outside project directory
    if (!absolutePath.startsWith(process.cwd())) {
      return { success: false, error: 'Target file location falls outside safe workspace boundaries.' };
    }

    const fileContent = await fs.readFile(absolutePath, 'utf-8');

    if (!fileContent.includes(originalCode)) {
      return { success: false, error: 'The source file content has changed since the diff was generated.' };
    }

    const updatedContent = fileContent.replace(originalCode, patchedCode);
    await fs.writeFile(absolutePath, updatedContent, 'utf-8');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
