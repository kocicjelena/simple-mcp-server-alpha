/* eslint-disable @typescript-eslint/no-explicit-any */

export interface MCPCapability {
  name: string;
  description: string;
  category: "tool" | "prompt" | "resource" | "sampling";
  enabled: boolean;
  details?: Record<string, any>;
}

/**
 * Get list of server capabilities
 */
export function getServerCapabilities(): MCPCapability[] {
  return [
    // Tool capabilities
    {
      name: "server_time",
      description: "Return the current server time as an ISO string",
      category: "tool",
      enabled: true,
      details: {
        inputParameters: [],
        outputType: "text",
      },
    },
    {
      name: "greet",
      description: "Return a greeting for a supplied name",
      category: "tool",
      enabled: true,
      details: {
        inputParameters: [
          {
            name: "name",
            type: "string",
            required: true,
            description: "Name to greet",
          },
        ],
        outputType: "text",
      },
    },
    {
      name: "echo",
      description: "Echo text back with optional uppercase formatting",
      category: "tool",
      enabled: true,
      details: {
        inputParameters: [
          {
            name: "message",
            type: "string",
            required: true,
            description: "Text to echo",
          },
          {
            name: "uppercase",
            type: "boolean",
            required: false,
            description: "Return the text in uppercase",
          },
        ],
        outputType: "text",
      },
    },
    {
      name: "sum",
      description: "Add two numbers and return the result",
      category: "tool",
      enabled: true,
      details: {
        inputParameters: [
          {
            name: "a",
            type: "number",
            required: true,
            description: "First number",
          },
          {
            name: "b",
            type: "number",
            required: true,
            description: "Second number",
          },
        ],
        outputType: "number",
      },
    },

    // Prompt capabilities
    {
      name: "code-review",
      description: "Prompt template for reviewing code with best practices",
      category: "prompt",
      enabled: true,
      details: {
        arguments: [
          {
            name: "language",
            type: "string",
            required: true,
            description: "Programming language of the code",
          },
          {
            name: "focus",
            type: "string",
            required: false,
            description: "Focus area: performance, security, readability, or all",
          },
        ],
      },
    },
    {
      name: "generate-docs",
      description: "Prompt template for generating API documentation",
      category: "prompt",
      enabled: true,
      details: {
        arguments: [
          {
            name: "format",
            type: "string",
            required: true,
            description: "Documentation format: markdown, openapi, or html",
          },
        ],
      },
    },
    {
      name: "generate-tests",
      description: "Prompt template for generating unit test cases",
      category: "prompt",
      enabled: true,
      details: {
        arguments: [
          {
            name: "framework",
            type: "string",
            required: true,
            description: "Testing framework: jest, mocha, pytest, junit, or other",
          },
          {
            name: "coverage-type",
            type: "string",
            required: false,
            description: "Coverage type: unit, integration, or e2e",
          },
        ],
      },
    },

    // Resource/Model capabilities
    {
      name: "models",
      description: "Access to local GGUF model files",
      category: "resource",
      enabled: true,
      details: {
        type: "model-loader",
        format: "GGUF",
        location: "public/models",
      },
    },
  ];
}

/**
 * Get capabilities grouped by category
 */
export function getCapabilitiesByCategory() {
  const capabilities = getServerCapabilities();
  return {
    tools: capabilities.filter((c) => c.category === "tool"),
    prompts: capabilities.filter((c) => c.category === "prompt"),
    resources: capabilities.filter((c) => c.category === "resource"),
    sampling: capabilities.filter((c) => c.category === "sampling"),
  };
}

/**
 * Get capability statistics
 */
export function getCapabilityStats() {
  const capabilities = getServerCapabilities();
  const byCategory = getCapabilitiesByCategory();

  return {
    total: capabilities.length,
    enabled: capabilities.filter((c) => c.enabled).length,
    disabled: capabilities.filter((c) => !c.enabled).length,
    byCategory: {
      tools: byCategory.tools.length,
      prompts: byCategory.prompts.length,
      resources: byCategory.resources.length,
      sampling: byCategory.sampling.length,
    },
  };
}
