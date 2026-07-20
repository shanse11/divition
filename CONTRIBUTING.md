# Contributing

1. 使用 Node.js 20+ 与 pnpm。
2. 复制 `.env.example` 为 `.env`，默认保持 Mock AI。
3. 修改 Next.js 功能前阅读 `node_modules/next/dist/docs/` 对应版本文档。
4. 保持 TypeScript strict，不引入大面积 `any`，并遵循现有 Server/Client Component 边界。
5. 提交前运行：

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

6. 不提交 `.env`、数据库密钥、AI 密钥或包含私人问题的日志。
7. 数据库 schema 变更应附迁移，并说明对既有数据的影响。
