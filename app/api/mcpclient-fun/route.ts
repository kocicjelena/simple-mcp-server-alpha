/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { mcpClientNew } from "@/lib/mcp/mcpclientnew";

type ToolCallPayload = {
  toolName?: string;
  args?: Record<string, unknown>;
  message?: string;
};

function resultToText(result: any): string {
  if (!result || !Array.isArray(result.content)) {
    return JSON.stringify(result ?? {}, null, 2);
  }

  const textBlocks = result.content
    .filter((item: any) => item?.type === "text" && typeof item.text === "string")
    .map((item: any) => item.text);

  return textBlocks.length > 0 ? textBlocks.join("\n") : JSON.stringify(result, null, 2);
}

export async function GET(req: Request) {
  let client: Awaited<ReturnType<typeof mcpClientNew>>["client"] | null = null;
  let transport: Awaited<ReturnType<typeof mcpClientNew>>["transport"] | null = null;

  try {
    const origin = new URL(req.url).origin;
    console.log("MCP Client connecting to origin:", origin);
    const connection = await mcpClientNew(origin);
    client = connection.client;
    transport = connection.transport;
console.log("MCP Client connected to:", origin,client.listPrompts(),transport);
    const listed = await client.listTools();

    return NextResponse.json({
      tools: listed.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await transport?.close?.().catch(() => undefined);
    await client?.close?.().catch(() => undefined);
  }
}

export async function POST(req: Request) {
  let client: Awaited<ReturnType<typeof mcpClientNew>>["client"] | null = null;
  let transport: Awaited<ReturnType<typeof mcpClientNew>>["transport"] | null = null;

  try {
    const body = (await req.json()) as ToolCallPayload;

    if (!body.message) {
      return NextResponse.json({ error: "toolName is required" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const connection = await mcpClientNew(origin);
    client = connection.client;
    transport = connection.transport;
const result = client.setRequestHandler('sampling/createMessage', async request => {
        const lastMessage = request.params.messages.at(-1);
        console.log('Sampling request:', lastMessage);
   
        // In production, send messages to your LLM here
        return {
            model: `${"qwen3.5:0.8b"}`,
            role: 'assistant' as const,
            content: {
                type: `${request.params.messages.entries()}` as const,
                text: `${request.params.messages.entries()}`
            },
            task: 'response' as const,
            metadata: {
                timestamp: Date.now()
            }
        };
    });
    //const result = await client.connect();
    // .callTool({
    //   name: body.toolName,
    //   arguments: body.args ?? {},
    // });

    //const toolText = resultToText(result);

    return NextResponse.json({
      result
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await transport?.close?.().catch(() => undefined);
    await client?.close?.().catch(() => undefined);
  }
}
