import {
  getServerCapabilities,
  getCapabilitiesByCategory,
  getCapabilityStats,
} from "@/lib/mcp/capabilities";
import { getAvailablePrompts } from "@/lib/mcp/prompts";
import { listModelMetadata } from "@/lib/mcp/models";

export const runtime = "nodejs";

/**
 * GET /api/mcpserver/info
 * Returns complete server information including all capabilities, prompts, and models
 */
export async function GET() {
  try {
    const capabilities = getServerCapabilities();
    const byCategory = getCapabilitiesByCategory();
    const stats = getCapabilityStats();
    const prompts = getAvailablePrompts();
    const models = await listModelMetadata();

    return Response.json({
      success: true,
      data: {
        server: {
          name: "nextjs-simple-mcpserver",
          version: "1.0.0",
          description: "Model Context Protocol server with tools, prompts, and models",
        },
        capabilities: {
          total: stats.total,
          enabled: stats.enabled,
          disabled: stats.disabled,
          byCategory: stats.byCategory,
          all: capabilities,
          grouped: byCategory,
        },
        prompts: {
          total: prompts.length,
          list: prompts,
          description:
            "Reusable prompt templates for common tasks like code review, documentation generation, and test creation",
        },
        models: {
          total: models.count,
          totalSizeMB: models.totalSizeMB,
          formats: models.formats,
          list: models.models,
          description:
            "GGUF format model files available for local inference and processing",
        },
        documentation: {
          tools: "Tools are functions that can be called by MCP clients to perform specific tasks",
          prompts:
            "Prompts are templates that guide AI models through specific tasks or workflows",
          models:
            "Models are GGUF format files that contain trained machine learning models",
          capabilities:
            "Capabilities describe what the server can do and is organized by type: tools, prompts, resources, and sampling",
        },
        endpoints: {
          capabilities: "/api/mcpserver/capabilities",
          prompts: "/api/mcpserver/prompts",
          models: "/api/mcpserver/models",
          info: "/api/mcpserver/info",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching server info:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch server information",
      },
      { status: 500 }
    );
  }
}
