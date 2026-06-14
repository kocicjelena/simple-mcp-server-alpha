/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import fs from 'fs/promises';
import path from 'path';

function getPaths(relativeFilePath: string) {
  const absolutePath = path.resolve(process.cwd(), relativeFilePath);
  if (!absolutePath.startsWith(process.cwd())) {
    throw new Error('Access denied: Workspace boundary violation.');
  }
  const backupPath = `${absolutePath}.bak`;
  return { absolutePath, backupPath };
}

// 1. COMMIT PATCH & CREATE BACKUP
export async function commitPatchAction({ filePath, originalCode, patchedCode }: { filePath: string; originalCode: string; patchedCode: string }) {
  if (process.env.NODE_ENV !== 'development') throw new Error('Restricted to Dev Mode');
  
  try {
    const { absolutePath, backupPath } = getPaths(filePath);
    const fileContent = await fs.readFile(absolutePath, 'utf-8');

    if (!fileContent.includes(originalCode)) {
      return { success: false, error: 'Source file code has changed since generation.' };
    }

    // Write a backup copy before altering the original file
    await fs.writeFile(backupPath, fileContent, 'utf-8');

    // Apply the string patch alteration
    const updatedContent = fileContent.replace(originalCode, patchedCode);
    await fs.writeFile(absolutePath, updatedContent, 'utf-8');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. ROLLBACK PATCH FROM BACKUP
export async function rollbackPatchAction(filePath: string) {
  if (process.env.NODE_ENV !== 'development') throw new Error('Restricted to Dev Mode');

  try {
    const { absolutePath, backupPath } = getPaths(filePath);
    
    // Read raw code from the backup cache
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    
    // Overwrite the modified file back to its original raw form
    await fs.writeFile(absolutePath, backupContent, 'utf-8');
    
    // Clean up the backup file from disk
    await fs.unlink(backupPath);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
