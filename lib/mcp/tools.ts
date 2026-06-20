/* eslint-disable @typescript-eslint/no-explicit-any */
import { McpServer } from "@modelcontextprotocol/server";
import { createObjectSchema } from "./schema";

function registerTool(
  server: McpServer,
  name: string,
  config: Record<string, unknown>,
  handler: unknown
) {
  server.registerTool(name, config as any, handler as any);
}

export function registerSimpleTools(server: McpServer) {
  registerTool(
    server,
    "server_time",
    {
      description: "Return the current server time as an ISO string.",
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => ({
      content: [{ type: "text", text: new Date().toISOString() }],
    })
  );

  registerTool(
    server,
    "greet",
    {
      description: "Return a greeting for a supplied name.",
      inputSchema: createObjectSchema({
        name: {
          type: "string",
          description: "Name to greet",
        },
      }) as any,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ name }: { name: string }) => ({
      content: [{ type: "text", text: `Hello, ${name}!` }],
    })
  );

  registerTool(
    server,
    "echo",
    {
      description: "Echo text back with optional uppercase formatting.",
      inputSchema: createObjectSchema({
        message: {
          type: "string",
          description: "Text to echo",
        },
        uppercase: {
          type: "boolean",
          description: "Return the text in uppercase",
          optional: true,
        },
      }) as any,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ message, uppercase }: { message: string; uppercase?: boolean }) => ({
      content: [
        {
          type: "text",
          text: uppercase ? message.toUpperCase() : message,
        },
      ],
    })
  );

  registerTool(
    server,
    "sum",
    {
      description: "Add two numbers and return the result.",
      inputSchema: createObjectSchema({
        a: {
          type: "number",
          description: "First number",
        },
        b: {
          type: "number",
          description: "Second number",
        },
      }) as any,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ a, b }: { a: number; b: number }) => ({
      content: [{ type: "text", text: String(a + b) }],
      structuredContent: { result: a + b },
    })
  );
}
