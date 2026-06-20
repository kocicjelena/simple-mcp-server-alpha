/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { mcpClientNew } from "@/lib/mcp/mcpclientnew";

type PromptCallPayload = {
  promptName?: string;
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

/**
 * GET /api/mcpclient-prompt
 * Lists all available prompts from the MCP server
 */
export async function GET(req: Request) {
  let client: Awaited<ReturnType<typeof mcpClientNew>>["client"] | null = null;
  let transport: Awaited<ReturnType<typeof mcpClientNew>>["transport"] | null = null;

  try {
    const origin = new URL(req.url).origin;
    const connection = await mcpClientNew(origin);
    client = connection.client;
    transport = connection.transport;

    const listed = await client.listPrompts();

    return NextResponse.json({
      success: true,
      prompts: listed.prompts.map((prompt) => ({
        name: prompt.name,
        description: prompt.description,
        arguments: prompt.arguments,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await transport?.close?.().catch(() => undefined);
    await client?.close?.().catch(() => undefined);
  }
}

/**
 * POST /api/mcpclient-prompt
 * Invokes a prompt with provided arguments
 */
export async function POST(req: Request) {
  let client: Awaited<ReturnType<typeof mcpClientNew>>["client"] | null = null;
  let transport: Awaited<ReturnType<typeof mcpClientNew>>["transport"] | null = null;

  try {
    const body = (await req.json()) as PromptCallPayload;

    if (!body.promptName) {
      return NextResponse.json(
        { success: false, error: "promptName is required" },
        { status: 400 }
      );
    }

    const origin = new URL(req.url).origin;
    const connection = await mcpClientNew(origin);
    client = connection.client;
    transport = connection.transport;

    // Get the prompt and call it with arguments
    const result = await client.getPrompt({
      name: body.promptName,
      arguments: body.args ?? {},
    });

    const promptText = resultToText(result);

    return NextResponse.json({
      success: true,
      answer: body.message
        ? `Message: ${body.message}\n\nPrompt: ${body.promptName}\n\n${promptText}`
        : `Prompt: ${body.promptName}\n\n${promptText}`,
      promptName: body.promptName,
      promptResult: result,
      promptText,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await transport?.close?.().catch(() => undefined);
    await client?.close?.().catch(() => undefined);
  }
}
