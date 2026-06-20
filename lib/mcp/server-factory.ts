/* eslint-disable @typescript-eslint/no-explicit-any */
import { McpServer } from "@modelcontextprotocol/server";
import { registerSimpleTools } from "./tools";
import { registerPrompts } from "./prompts";

/**
 * Create and configure the MCP server with all capabilities
 */
export async function createMCPServer(): Promise<McpServer> {
  const server = new McpServer({
    name: "nextjs-simple-mcpserver",
    version: "1.0.0",
  });

  // Register all capabilities
  registerSimpleTools(server);
  registerPrompts(server);

  return server;
}
