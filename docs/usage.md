# 利用方法ドキュメント

このドキュメントでは、UUID生成MCPサーバーの利用方法について説明します。

## 依存関係のインストール

このサーバーを実行するには、以下の依存関係が必要です。

*   `@modelcontextprotocol/sdk`
*   `uuid`

これらの依存関係は、以下のコマンドでインストールできます。

```bash
pnpm install
```

## ビルド

TypeScriptコードをJavaScriptにコンパイルするには、以下のコマンドを実行します。

```bash
pnpm run build
```

このコマンドは、`tsconfig.json` の設定に基づいて `tsc` (TypeScriptコンパイラ) を実行し、`dist/index.js` を生成します。

## Cline (または他のMCPクライアント) での利用

このサーバーをClineから利用するには、以下の手順でMCP設定ファイルに登録する必要があります。

1.  clineの設定ファイル (`cline_mcp_settings.json`) を開きます。
2.  `mcpServers` オブジェクトに、以下の設定を追加します。

```json
{
  "mcpServers": {
    "uuid-generator": {
      "command": "node",
      "args": ["/path/to/uuid-mcp-server/dist/index.js"], // リポジトリをクローンした実際のディレクトリパスに置き換えてください
      "env": {},
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

*   `uuid-generator` は、サーバーを識別するための一意な名前です。
*   `args` には、ビルドされた `index.js` ファイルへの絶対パスを指定します。

3.  Clineを再起動するか、MCPサーバーを再読み込みします。

## ツールの呼び出し

clineから `generate_uuid` ツールを呼び出すには、例えば以下のように指示します。

```
uuid-generatorでuuidを生成してください。
```
