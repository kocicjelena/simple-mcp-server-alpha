import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import fs from "fs";
import path from "path";

export async function getNextDevTools() {
  // 1. Read config
  const configPath = path.join(process.cwd(), ".mcp.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const devToolsConfig = config.mcpServers["next-devtools"];

  // 2. Spawn the MCP process via Stdio transport
  const transport = new StdioClientTransport({
    command: devToolsConfig.command,
    args: devToolsConfig.args,
  });

  const client = new Client({
    name: "next-js-agent-host",
    version: "1.0.0",
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  return client;
}
