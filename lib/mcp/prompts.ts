/* eslint-disable @typescript-eslint/no-explicit-any */
import { McpServer } from "@modelcontextprotocol/server";

export interface PromptDefinition {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

/**
 * Register prompts with the MCP server
 * Prompts are reusable templates that can be invoked by clients
 */
export function registerPrompts(server: McpServer) {
  // Example prompt: coding assistant
  server.registerPrompt(
    "code-review",
    {
      description: "Prompt for reviewing code with best practices",
      arguments: [
        {
          name: "language",
          description: "Programming language of the code",
          required: true,
        },
        {
          name: "focus",
          description: "Focus area: performance, security, readability, or all",
          required: false,
        },
      ],
    },
    async (args: any) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please review the following ${args.language} code for ${args.focus || "general best practices"}:\n\n[Code will be provided by client]`,
          },
        },
      ],
    })
  );

  // Example prompt: documentation generator
  server.registerPrompt(
    "generate-docs",
    {
      description: "Prompt for generating API documentation",
      arguments: [
        {
          name: "format",
          description: "Documentation format: markdown, openapi, or html",
          required: true,
        },
      ],
    },
    async (args: any) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Generate ${args.format} documentation for the following API:\n\n[API details will be provided by client]`,
          },
        },
      ],
    })
  );

  // Example prompt: test case generator
  server.registerPrompt(
    "generate-tests",
    {
      description: "Prompt for generating unit test cases",
      arguments: [
        {
          name: "framework",
          description: "Testing framework: jest, mocha, pytest, junit, or other",
          required: true,
        },
        {
          name: "coverage-type",
          description: "Coverage type: unit, integration, or e2e",
          required: false,
        },
      ],
    },
    async (args: any) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Generate ${args.coverage_type || "unit"} tests using ${args.framework} for:\n\n[Function/component code will be provided by client]`,
          },
        },
      ],
    })
  );
}

/**
 * Get list of available prompts
 */
export function getAvailablePrompts(): PromptDefinition[] {
  return [
    {
      name: "code-review",
      description: "Prompt for reviewing code with best practices",
      arguments: [
        {
          name: "language",
          description: "Programming language of the code",
          required: true,
        },
        {
          name: "focus",
          description: "Focus area: performance, security, readability, or all",
          required: false,
        },
      ],
    },
    {
      name: "generate-docs",
      description: "Prompt for generating API documentation",
      arguments: [
        {
          name: "format",
          description: "Documentation format: markdown, openapi, or html",
          required: true,
        },
      ],
    },
    {
      name: "generate-tests",
      description: "Prompt for generating unit test cases",
      arguments: [
        {
          name: "framework",
          description: "Testing framework: jest, mocha, pytest, junit, or other",
          required: true,
        },
        {
          name: "coverage-type",
          description: "Coverage type: unit, integration, or e2e",
          required: false,
        },
      ],
    },
  ];
}
