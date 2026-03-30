# 商务咨询公司官网 + 简易CMS

## 本地开发

```bash
pnpm install
pnpm run dev
```

## Cloudflare 部署

- 本项目为纯前端 SPA（无 Windows 服务器依赖），生产环境产物为静态文件。
- 登录/数据库/文件存储等后端能力由 Supabase 提供，前端通过环境变量读取 Supabase 配置。

### 1) Cloudflare Pages（静态托管）

1. 将仓库推送到 GitHub。
2. Cloudflare Dashboard → Pages → Create a project → 选择 GitHub 仓库。
3. 构建配置：
   - Build command: `pnpm run build`
   - Build output directory: `dist`
4. 环境变量（Production/Preview 都建议配置）：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 2) Cloudflare Workers（Assets + Wrangler）

- 如果你在 Cloudflare 创建的是 Worker 并用 `npx wrangler deploy` 部署：本仓库已提供 `wrangler.jsonc`，并配置了 `assets.not_found_handling = "single-page-application"`，刷新 `/admin/*`、`/detail/*` 等路由不会 404。
- Workers 模式下不使用 `public/_redirects`，避免 Wrangler 校验报错。

---

## 富内容图片/视频上传（Supabase Storage）

本项目支持在 CMS 富内容编辑器中：选择图片/视频文件 → 自动上传到 Supabase Storage → 自动回填公开 URL。

### 1) 一次性初始化（已提供迁移）

- 已新增迁移文件：`supabase/migrations/002_storage_public_media.sql`
- 该迁移会创建/更新公开 bucket：`public-media`，并为 `anon` 开放读取、为 `authenticated` 开放增删改。

### 2) 手动方式（如果你不想用迁移）

在 Supabase 控制台：

1. Storage → 创建 bucket：`public-media`，勾选 Public
2. Storage Policies（或 SQL Editor）为 `storage.objects` 添加策略：
   - `anon` 可 `SELECT`（仅 `bucket_id = 'public-media'`）
   - `authenticated` 可 `INSERT/UPDATE/DELETE`（仅 `bucket_id = 'public-media'`）

---

## 模板说明

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  extends: [
    // other configs...
    // Enable lint rules for React
    reactX.configs['recommended-typescript'],
    // Enable lint rules for React DOM
    reactDom.configs.recommended,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
