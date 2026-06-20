import {
  getServerCapabilities,
  getCapabilitiesByCategory,
  getCapabilityStats,
} from "@/lib/mcp/capabilities";

export const runtime = "nodejs";

/**
 * GET /api/mcpserver/capabilities
 * Returns all available server capabilities grouped by category
 */
export async function GET() {
  const capabilities = getServerCapabilities();
  const byCategory = getCapabilitiesByCategory();
  const stats = getCapabilityStats();

  return Response.json({
    success: true,
    data: {
      capabilities,
      byCategory,
      stats,
      summary: {
        description:
          "MCP Server capabilities for building with @modelcontextprotocol",
        serverName: "nextjs-simple-mcpserver",
        version: "1.0.0",
      },
    },
  });
}
