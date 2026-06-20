import { discoverModels, getModelsStats, listModelMetadata } from "@/lib/mcp/models";

export const runtime = "nodejs";

/**
 * GET /api/mcpserver/models
 * Returns list of available GGUF models in public/models directory
 */
export async function GET() {
  try {
    const stats = await getModelsStats();
    const metadata = await listModelMetadata();

    return Response.json({
      success: true,
      data: {
        summary: {
          description: "Available GGUF models for MCP server",
          totalCount: stats.total,
          totalSizeMB: stats.totalSizeMB,
          formats: stats.formats,
        },
        models: metadata.models,
        instructions: {
          setup: "Place GGUF model files in the public/models directory",
          supportedFormats: Object.keys(stats.formats),
          example: "model-name.gguf",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch models",
      },
      { status: 500 }
    );
  }
}
