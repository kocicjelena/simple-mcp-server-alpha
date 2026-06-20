/* eslint-disable @typescript-eslint/no-explicit-any */
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server";
import { createMCPServer } from "@/lib/mcp/server-factory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handleMcpRequest(request: Request): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  const server = await createMCPServer();
  await server.connect(transport);

  return transport.handleRequest(request);
}

export { handleMcpRequest as DELETE, handleMcpRequest as GET, handleMcpRequest as POST };
