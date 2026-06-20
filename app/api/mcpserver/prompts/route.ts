import { getAvailablePrompts } from "@/lib/mcp/prompts";

export const runtime = "nodejs";

/**
 * GET /api/mcpserver/prompts
 * Returns list of available prompt templates
 */
export async function GET() {
  const prompts = getAvailablePrompts();

  return Response.json({
    success: true,
    data: {
      summary: {
        description: "Available prompt templates for MCP server",
        total: prompts.length,
      },
      prompts,
      usage: {
        explanation:
          "Prompts are reusable templates that can be invoked by MCP clients",
        example: {
          name: "code-review",
          arguments: {
            language: "typescript",
            focus: "security",
          },
        },
      },
    },
  });
}
