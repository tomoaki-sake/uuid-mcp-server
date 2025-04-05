# コード解説ドキュメント

このドキュメントでは、`src/index.ts` のコードについて、各部分の役割や処理の流れを詳しく解説します。

## インポートセクション

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuidv4 } from 'uuid';
```

*   `@modelcontextprotocol/sdk` からは、MCPサーバーを構築するために必要なクラスや型をインポートしています。
    *   `Server`: MCPサーバーのインスタンスを作成するためのクラスです。
    *   `StdioServerTransport`: 標準入出力 (stdio) を使用してMCPクライアントと通信するためのクラスです。
    *   `CallToolRequestSchema`, `ListToolsRequestSchema`: リクエストの型を定義するためのスキーマです。
    *   `ErrorCode`, `McpError`: エラー処理に使用する型です。
*   `uuid` からは、UUIDを生成するための関数 `uuidv4` をインポートしています。

## サーバー初期化

```typescript
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
```

`Server` クラスのインスタンスを作成し、MCPサーバーを初期化しています。

*   `name`: サーバーの名前です。MCPクライアントに表示されます。
*   `version`: サーバーのバージョンです。
*   `capabilities`: サーバーの機能（リソースとツール）を定義します。このサーバーでは、リソースは定義せず、ツールのみを定義します。

## ツールリストハンドラ (`ListToolsRequestSchema`)

```typescript
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
```

`ListToolsRequestSchema` は、MCPクライアントがサーバーに利用可能なツールの一覧を要求したときに呼び出されるハンドラを定義します。

このサーバーでは、`generate_uuid` という名前のツールを1つだけ提供します。

*   `name`: ツールの名前です。MCPクライアントがツールを呼び出す際に使用します。
*   `description`: ツールの説明です。MCPクライアントに表示されます。
*   `inputSchema`: ツールの入力パラメータを定義するJSON Schemaです。`generate_uuid` ツールはパラメータを必要としないため、空のオブジェクトを定義しています。

## ツール呼び出しハンドラ (`CallToolRequestSchema`) とUUID生成

```typescript
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== 'generate_uuid') {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
    }

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
```

`CallToolRequestSchema` は、MCPクライアントがツールを呼び出したときに呼び出されるハンドラを定義します。

*   まず、リクエストされたツールの名前が `generate_uuid` であることを確認します。
*   次に、`uuidv4()` 関数を呼び出して新しいUUIDを生成します。
*   最後に、生成されたUUIDをテキスト形式でMCPクライアントに返信します。

## エラーハンドリングと終了処理

```typescript
  server.onerror = (error) => console.error('[MCP Error]', error);
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
```

*   `server.onerror` は、MCPサーバー内で発生したエラーを処理するためのハンドラを定義します。
*   `process.on('SIGINT')` は、Ctrl+Cなどでサーバーが終了されたときにクリーンアップ処理を行うためのハンドラを定義します。

## サーバー起動

```typescript
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('UUID MCP server running on stdio');
```

`StdioServerTransport` を使用してMCPクライアントとの接続を確立し、サーバーを起動します。
