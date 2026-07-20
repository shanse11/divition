# 星语秘境 Astral Oracle

一款以 AI 塔罗为核心的沉浸式神秘学 Web 产品。当前版本包含完整塔罗流程、Mock/OpenAI-compatible 结构化解读、匿名与邮箱账号、历史/收藏/笔记、隐私分享、每日一牌、十二星座、AI 解梦与关系占卜入口。

## 技术栈

Next.js 16 App Router、React 19、TypeScript strict、Tailwind CSS 4、shadcn/Radix UI、Framer Motion、Zustand、Zod、Prisma 6（本地 SQLite / 生产 Neon PostgreSQL）、Vitest、Playwright。

## 安装与运行

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

打开 http://localhost:3000。默认 `AI_PROVIDER=mock`，不需要 API Key。执行 Seed 后可使用演示账号 `demo@astral-oracle.local` / `Astral2026`。

## 常用命令

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm db:migrate
pnpm db:studio
```

## AI 配置

Mock 模式开箱即用。连接兼容 OpenAI Chat Completions 的服务时设置：

```env
AI_PROVIDER=openai-compatible
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your-key
AI_MODEL=gpt-4o-mini
AI_TIMEOUT=60000
```

密钥仅在 Route Handler 服务端读取。响应经过 Zod 校验，超时、网络错误或结构不合法时回退本地模板。

## 主要路由

- `/` 首页
- `/tarot`、`/tarot/reading`、`/tarot/result/[id]` 塔罗流程
- `/daily` 每日一牌
- `/zodiac` 十二星座
- `/dream` 解梦
- `/relationship` 关系占卜
- `/history`、`/favorites` 记录与收藏
- `/login`、`/register`、`/profile`、`/settings` 用户功能
- `/share/[id]` 隐私分享页
- `/about` 隐私与免责声明

## 数据库与部署

本地开发使用 SQLite，模型定义与迁移位于 `prisma/`：

```bash
pnpm db:migrate
pnpm db:seed # 可选：本地演示数据
```

`pnpm dev` 与 `pnpm test:e2e` 会自动生成 SQLite Prisma Client。若手动执行过 `pnpm vercel-build`，无需额外恢复：下次启动开发服务器或 E2E 测试时会自动恢复本地客户端。

生产环境使用 Neon PostgreSQL，**不能**把 `prisma/dev.db` 上传到 Vercel。生产 schema 与全新的 PostgreSQL 初始迁移位于 `prisma-postgres/`，它与 SQLite migration 相互独立，避免把 SQLite 专用 SQL 应用到 Neon。

1. 在 Neon 创建空数据库，复制 pooled URL 和 direct URL；不要将它们提交到 Git。
2. 在 Vercel 的 Production 环境变量中设置：

   ```env
   DATABASE_URL=Neon pooled URL
   DIRECT_URL=Neon direct URL
   NEXT_PUBLIC_APP_URL=https://shanse.dev
   AUTH_SECRET=使用 openssl rand -base64 32 生成的随机值
   AI_PROVIDER=mock
   ```

3. 使用 direct URL 在部署前或 CI 中执行生产迁移：

   ```bash
   pnpm db:deploy
   ```

4. 在 Vercel 的 Build Command 设置为 `pnpm vercel-build`。该命令会先按 PostgreSQL schema 生成 Prisma Client，再执行 Next.js 生产构建。
5. 在 Vercel 项目中添加 `shanse.dev` 与 `www.shanse.dev`，按其 Domains 页面提示在 Porkbun 配置 DNS；将 `www.shanse.dev` 重定向到 `shanse.dev`。

`DATABASE_URL` 是应用运行时使用的 Neon pooled URL；`DIRECT_URL` 仅供 Prisma CLI 的迁移、数据库检查等需要直连的操作使用。生产环境不自动执行 seed，以免创建公网演示账号。

## 当前边界

- 星座内容为娱乐型模板，不包含本命盘算法。
- 声音由 Web Audio API 在浏览器中实时合成（原创轻量音调与环境纹理），不加载或分发任何外部/受版权保护的音频素材；默认静音，用户交互后才初始化。
- 分享海报可按需选择问题、逐牌解读、行动建议、牌阵、日期、品牌与免责声明；私人问题和详细解读默认关闭。
- 设置页当前展示偏好，完整编辑、数据导出和账号删除仍可增强。
- Playwright 浏览器端流程建议在 CI 中持续补全。

所有占卜、星座与梦境内容仅供娱乐和自我反思，不构成医疗、心理、法律或投资建议。
