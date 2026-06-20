# MCP Server Architecture

This directory contains modular components for building an MCP (Model Context Protocol) server.

## Directory Structure

```
lib/mcp/
├── schema.ts          # Schema validation utilities
├── tools.ts           # Tool registration
├── prompts.ts         # Prompt template registration
├── capabilities.ts    # Capability definitions and discovery
├── models.ts          # Model file discovery and management
└── server-factory.ts  # MCP server creation and configuration

app/api/mcpserver/
├── [transport]/route.ts    # Main MCP server endpoint
├── capabilities/route.ts   # GET /api/mcpserver/capabilities
├── prompts/route.ts        # GET /api/mcpserver/prompts
├── models/route.ts         # GET /api/mcpserver/models
└── info/route.ts           # GET /api/mcpserver/info (complete server info)
```

## Components

### 1. **schema.ts**
Utility functions for creating and validating schemas.
- `createObjectSchema()` - Creates validated object schemas for tool inputs/outputs
- Provides consistent validation across all tools

### 2. **tools.ts**
Registers all available tools with the MCP server.
- `registerSimpleTools()` - Registers default tools (server_time, greet, echo, sum)
- Easy to add new tools following the same pattern

### 3. **prompts.ts**
Registers prompt templates for clients to use.
- `registerPrompts()` - Sets up prompt templates
- `getAvailablePrompts()` - Returns list of all prompts
- Examples: code-review, generate-docs, generate-tests

### 4. **capabilities.ts**
Defines and discovers server capabilities.
- `getServerCapabilities()` - Returns all capabilities
- `getCapabilitiesByCategory()` - Groups capabilities by type
- `getCapabilityStats()` - Returns statistics about capabilities
- Supports: tools, prompts, resources, sampling

### 5. **models.ts**
Discovers and manages GGUF model files.
- `discoverModels()` - Scans public/models directory
- `getModelByName()` - Find specific model
- `getModelsStats()` - Returns model statistics
- Supports: .gguf, .bin, .pt, .pth, .safetensors

### 6. **server-factory.ts**
Factory function for creating configured MCP server.
- `createMCPServer()` - Creates and configures the server with all capabilities

## API Endpoints

### `/api/mcpserver/capabilities`
**GET** - Returns all server capabilities grouped by category
```json
{
  "success": true,
  "data": {
    "capabilities": [...],
    "byCategory": { "tools": [...], "prompts": [...], ... },
    "stats": { "total": 10, "enabled": 10, ... }
  }
}
```

### `/api/mcpserver/prompts`
**GET** - Returns available prompt templates
```json
{
  "success": true,
  "data": {
    "summary": { "total": 3 },
    "prompts": [...],
    "usage": {...}
  }
}
```

### `/api/mcpserver/models`
**GET** - Returns available GGUF models
```json
{
  "success": true,
  "data": {
    "summary": { "totalCount": 2, "totalSizeMB": 4500 },
    "models": [
      {
        "name": "model-name",
        "filename": "model-name.gguf",
        "sizeInMB": 4500,
        "format": "gguf"
      }
    ]
  }
}
```

### `/api/mcpserver/info`
**GET** - Returns complete server information (all capabilities, prompts, and models)
```json
{
  "success": true,
  "data": {
    "server": { "name": "nextjs-simple-mcpserver", "version": "1.0.0" },
    "capabilities": {...},
    "prompts": {...},
    "models": {...},
    "endpoints": {...}
  }
}
```

### `/mcpserver/[transport]`
**GET/POST/DELETE** - Main MCP server endpoint for protocol communication

## Adding New Features

### Adding a New Tool

1. Update `lib/mcp/tools.ts`:
```typescript
export function registerSimpleTools(server: McpServer) {
  // Add your tool...
  registerTool(
    server,
    "my-tool",
    {
      description: "What my tool does",
      inputSchema: createObjectSchema({
        param: {
          type: "string",
          description: "Parameter description",
        },
      }) as any,
    },
    async ({ param }) => ({
      content: [{ type: "text", text: `Result: ${param}` }],
    })
  );
}
```

2. Update `lib/mcp/capabilities.ts` to add the capability

### Adding a New Prompt

1. Update `lib/mcp/prompts.ts`:
```typescript
server.registerPrompt(
  "my-prompt",
  {
    description: "What this prompt does",
    arguments: [
      { name: "arg1", description: "...", required: true },
    ],
  },
  async (args) => ({
    messages: [
      {
        role: "user",
        content: { type: "text", text: `...` },
      },
    ],
  })
);
```

2. Update `lib/mcp/capabilities.ts` to add the capability

### Adding Models

1. Place GGUF files in `public/models/` directory:
   - `my-model.gguf`
   - `another-model.bin`

2. Models are automatically discovered when you call `/api/mcpserver/models`

## Testing the API

```bash
# Get all capabilities
curl http://localhost:3000/api/mcpserver/capabilities

# Get prompts
curl http://localhost:3000/api/mcpserver/prompts

# Get models
curl http://localhost:3000/api/mcpserver/models

# Get complete info
curl http://localhost:3000/api/mcpserver/info
```

## Features

✅ Modular architecture - easy to maintain and extend
✅ Tool registration with schema validation
✅ Prompt template support
✅ Automatic capability discovery
✅ Model file discovery from public/models
✅ Complete server information endpoint
✅ Type-safe TypeScript throughout
✅ Error handling and logging
