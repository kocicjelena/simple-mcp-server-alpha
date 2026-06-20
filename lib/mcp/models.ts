/* eslint-disable @typescript-eslint/no-explicit-any */
import { readdir, stat } from "fs/promises";
import { join } from "path";

export interface ModelInfo {
  name: string;
  filename: string;
  path: string;
  size: number;
  sizeInMB: number;
  format: string;
  type: "model" | "unknown";
  createdAt?: Date;
  modifiedAt?: Date;
}

/**
 * Get the models directory path
 */
export function getModelsDir(): string {
  return join(process.cwd(), "public", "models");
}

/**
 * Discover GGUF model files in the public/models directory
 */
export async function discoverModels(): Promise<ModelInfo[]> {
  try {
    const modelsDir = getModelsDir();
    const files = await readdir(modelsDir);

    const models: ModelInfo[] = [];

    for (const file of files) {
      if (file.startsWith(".")) continue; // Skip hidden files

      const filePath = join(modelsDir, file);

      try {
        const stats = await stat(filePath);

        // Only include GGUF files and other model formats
        if (
          file.endsWith(".gguf") ||
          file.endsWith(".bin") ||
          file.endsWith(".pt") ||
          file.endsWith(".pth") ||
          file.endsWith(".safetensors")
        ) {
          const format = file.split(".").pop()?.toLowerCase() || "unknown";

          models.push({
            name: file.replace(/\.(gguf|bin|pt|pth|safetensors)$/, ""),
            filename: file,
            path: `/models/${file}`,
            size: stats.size,
            sizeInMB: Math.round((stats.size / 1024 / 1024) * 100) / 100,
            format: format,
            type: "model",
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
          });
        }
      } catch (err) {
        console.warn(`Error scanning file ${file}:`, err);
      }
    }

    return models.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error("Error discovering models:", err);
    return [];
  }
}

/**
 * Get model by name
 */
export async function getModelByName(name: string): Promise<ModelInfo | null> {
  const models = await discoverModels();
  return models.find((m) => m.name === name) || null;
}

/**
 * Get model statistics
 */
export async function getModelsStats() {
  const models = await discoverModels();

  const totalSize = models.reduce((sum, m) => sum + m.size, 0);
  const totalSizeMB = Math.round((totalSize / 1024 / 1024) * 100) / 100;

  const byFormat: Record<string, number> = {};
  models.forEach((m) => {
    byFormat[m.format] = (byFormat[m.format] || 0) + 1;
  });

  return {
    total: models.length,
    totalSize,
    totalSizeMB,
    formats: byFormat,
    models,
  };
}

/**
 * List available model metadata
 */
export async function listModelMetadata() {
  const stats = await getModelsStats();

  return {
    count: stats.total,
    totalSizeMB: stats.totalSizeMB,
    formats: stats.formats,
    models: stats.models.map((m) => ({
      name: m.name,
      filename: m.filename,
      sizeInMB: m.sizeInMB,
      format: m.format,
      downloadUrl: `/public${m.path}`,
    })),
  };
}
