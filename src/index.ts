#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  const server = new Server(
    {
      name: 'uuid-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        resources: {}, // No resources defined
        tools: {},     // Tools will be defined below
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'generate_uuid',
        description: 'Generate a version 4 UUID.',
        inputSchema: { // No input parameters needed
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ],
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== 'generate_uuid') {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
    }

    // No arguments expected for this tool

    try {
      const newUuid = uuidv4();
      return {
        content: [
          {
            type: 'text',
            text: newUuid,
          },
        ],
      };
    } catch (error) {
      console.error('Error generating UUID:', error);
      throw new McpError(
        ErrorCode.InternalError,
        'Failed to generate UUID.'
      );
    }
  });

  // Error handling
  server.onerror = (error) => console.error('[MCP Error]', error);
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('UUID MCP server running on stdio');
}

main().catch(console.error);
