# Exif Photo 部署指南

本指南将协助您将 Exif Photo 项目部署到 Cloudflare 平台。本项目基于 **SvelteKit**，并使用 **Cloudflare Workers (with Assets)** 进行托管，数据库使用 **Cloudflare D1**，文件存储使用 **Cloudflare R2**，身份验证使用 **Better Auth**。

---

## 目录

1. [准备工作](#准备工作)
2. [Cloudflare 资源创建](#cloudflare-资源创建)
   - [1. 创建 D1 数据库](#1-创建-d1-数据库)
   - [2. 创建 R2 存储桶](#2-创建-r2-存储桶)
   - [3. 获取 API 凭证](#3-获取-api-凭证)
3. [项目配置文件配置](#项目配置文件配置)
   - [1. 配置 `wrangler.jsonc`](#1-配置-wranglerjsonc)
   - [2. 配置 `.env` 环境变量](#2-配置-env-环境变量)
4. [数据库 Schema 迁移](#数据库-schema-迁移)
   - [1. 生成迁移文件](#1-生成迁移文件)
   - [2. 本地开发环境数据库初始化](#2-本地开发环境数据库初始化)
   - [3. 生产环境（远程 D1）数据库初始化](#3-生产环境远程-d1数据库初始化)
5. [配置生产环境 Secrets 与变量](#配置生产环境-secrets-与变量)
6. [构建与部署项目](#构建与部署项目)
7. [常见问题排查](#常见问题排查)

---

## 准备工作

在开始部署前，请确保您已准备好以下环境与工具：

- **Node.js** (建议 v20 或更高版本)
- **npm** 包管理器
- **Cloudflare 账号**（已开通 D1 和 R2 服务）
- 在终端中登录 Cloudflare 账号：
  ```bash
  npx wrangler login
  ```

---

## Cloudflare 资源创建

### 1. 创建 D1 数据库

在终端中运行以下命令以在您的 Cloudflare 账号中创建一个新的 D1 数据库：

```bash
npx wrangler d1 create exif-photo
```

创建成功后，终端将输出如下信息：

```text
✅ Successfully created database 'exif-photo' on account <YOUR_ACCOUNT_ID>
Created database exif-photo with ID <YOUR_DATABASE_ID>
```

**请记录下输出的 `database_id`**，后续步骤中会用到。

### 2. 创建 R2 存储桶

运行以下命令创建用于存储照片的 R2 存储桶：

```bash
npx wrangler r2 bucket create exif-photo
```

创建成功后，请确保在 Cloudflare Dashboard 中为该存储桶配置**公共访问权限 (Public Access)**，或者绑定自定义域名，以便能够通过 URL 访问图片。

- **自定义域（推荐）**：在 R2 存储桶的 `Settings` -> `Public Access` 下绑定您的域名（例如 `assets.yourdomain.com`）。
- **R2.dev 子域**：在 `Settings` -> `Public Access` 下启用 `r2.dev` 临时公共子域。

### 3. 获取 API 凭证

为了让本地的 Drizzle Kit 可以通过 HTTP 协议管理远程 D1 数据库，您需要获取以下凭证：

1. **Cloudflare Account ID**：可以在 Cloudflare Dashboard 的 Workers & Pages 页面右侧找到。
2. **Database ID**：即第一步创建 D1 数据库时生成的 ID。
3. **Cloudflare D1 Token (API Token)**：
   - 访问 [Cloudflare API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)。
   - 点击 **Create Token**。
   - 选择 **Read and write Cloudflare D1** 模板（或者自定义 Token，给予 `Account -> D1 -> Edit` 权限）。
   - 创建并复制生成的 Token 字符串。

---

## 项目配置文件配置

### 1. 配置 `wrangler.jsonc`

编辑项目根目录下的 [wrangler.jsonc](file:///Users/abiee/Codes/exif-photo/wrangler.jsonc) 文件，更新 `database_id`：

```jsonc
{
	"$schema": "./node_modules/wrangler/config-schema.json",
	"name": "exif-photo",
	"compatibility_date": "2026-06-21",
	"compatibility_flags": ["nodejs_als"],
	"main": ".svelte-kit/cloudflare/_worker.js",
	"assets": {
		"binding": "ASSETS",
		"directory": ".svelte-kit/cloudflare"
	},
	"workers_dev": true,
	"preview_urls": true,
	"vars": {
		"R2_PUBLIC_URL": "https://<你的R2公共访问域名或R2.dev子域>" // 例如：https://assets.yourdomain.com
	},
	"r2_buckets": [
		{
			"bucket_name": "exif-photo",
			"binding": "BUCKET"
		}
	],
	"d1_databases": [
		{
			"binding": "DB",
			"database_name": "exif-photo",
			"database_id": "<你的D1数据库ID>", // 填写第一步创建 of D1 database_id
			"migrations_dir": "./drizzle"
		}
	]
}
```

### 2. 配置 `.env` 环境变量

在项目根目录下创建/编辑 `.env` 文件。**此文件用于本地开发环境和 Drizzle Kit 迁移工具**：

```env
# Cloudflare D1 远程管理配置 (用于 drizzle-kit)
CLOUDFLARE_ACCOUNT_ID="你的Cloudflare账户ID"
CLOUDFLARE_DATABASE_ID="你的D1数据库ID"
CLOUDFLARE_D1_TOKEN="你的Cloudflare D1 API Token"

# 生产环境/本地环境主域名
ORIGIN="https://your-app-domain.pages.dev" # 如果尚未部署，可以先填写后续 Cloudflare 部署生成的域名，本地开发时为 http://localhost:5173

# Better Auth 密钥 (必须为 32 位高熵随机字符串)
# 可通过运行 `npx better-auth secret` 或 `openssl rand -hex 16` 生成
BETTER_AUTH_SECRET="你的32位随机安全字符串"
```

---

## 数据库 Schema 迁移

### 1. 生成迁移文件

本项目使用 Drizzle ORM 管理数据库。每次修改 `src/lib/server/db/schema.ts` 后，都需要重新生成迁移文件：

```bash
npm run db:generate
```

此命令将在根目录下生成 `drizzle/` 文件夹及相关的 SQL 迁移文件。

### 2. 本地开发环境数据库初始化

如果您要在本地运行和测试项目，需要将迁移应用到本地 Wrangler 虚拟的 D1 数据库：

```bash
npm run db:local
```

_(这会调用 `npx wrangler d1 migrations apply DB --local`)_

### 3. 生产环境（远程 D1）数据库初始化

使用以下命令将生成的迁移应用到 Cloudflare 上的远程 D1 数据库：

```bash
npm run db:remote
```

_(这会调用 `npx wrangler d1 migrations apply DB --remote`)_

---

## 配置生产环境 Secrets 与变量

Cloudflare Workers 无法直接读取本地的 `.env` 文件中的敏感信息，因此您需要将密钥上传至 Cloudflare Secret 存储中：

### 1. 配置 Better Auth Secret

在终端中执行以下命令以向 Cloudflare 部署环境添加 Better Auth 密钥：

```bash
npx wrangler secret put BETTER_AUTH_SECRET
```

终端会提示您输入值，请粘贴您在 `.env` 中生成的 `BETTER_AUTH_SECRET` 的值并回车。

### 2. 配置部署 ORIGIN

`Better Auth` 在安全验证时会校验请求来源，因此生产环境必须配置 `ORIGIN` 环境变量。您可以通过以下两种方式之一进行配置：

- **方法 A：在 Cloudflare Dashboard 中配置（推荐）**
  1. 登录 Cloudflare Dashboard。
  2. 导航至 `Workers & Pages` -> 点击您的项目 `exif-photo`。
  3. 进入 `Settings` -> `Variables`。
  4. 在 `Environment Variables` 下，添加 `ORIGIN` 变量，值为您的线上域名（例如 `https://exif-photo.pages.dev` 或您的自定义域名）。

- **方法 B：在 `wrangler.jsonc` 中直接配置**
  可以直接在 `wrangler.jsonc` 中的 `"vars"` 中配置 `ORIGIN`。**请注意，如果在此配置，该值会暴露在代码库中。**

---

## 构建与部署项目

配置全部完成后，即可打包并部署项目：

### 1. 构建项目

```bash
npm run build
```

此命令将生成 Wrangler Worker 脚本及静态资产文件，保存在 `.svelte-kit/cloudflare` 目录中。

### 2. 部署到 Cloudflare

```bash
npx wrangler deploy
```

Wrangler 将自动读取 `wrangler.jsonc` 配置，将打包好的应用及静态资源上传到 Cloudflare 网络中。

部署成功后，终端将输出您的项目访问域名（形如 `https://exif-photo.<your-subdomain>.workers.dev`）。

---

## 常见问题排查

### 1. 登录 Better Auth 时提示跨域或重定向错误

- **原因**：没有正确配置 `ORIGIN` 或 `ORIGIN` 与当前访问的域名不一致。
- **解决方法**：检查 Cloudflare Dashboard 的环境变量中是否添加了 `ORIGIN`，并且其值包含 `https://` 协议且末尾没有多余的斜杠 `/`。

### 2. 运行时报错 `D1 binding "DB" not found` 或 `R2 binding "BUCKET" not found`

- **原因**：本地运行没有使用 wrangler 模拟器，或者远程部署时没有正确配置绑定。
- **解决方法**：
  - 本地预览生产包应运行 `npm run preview`（内部使用 `wrangler dev` 模拟 Workers 运行环境）。
  - 远程部署时确保 `wrangler.jsonc` 中的 `r2_buckets` 和 `d1_databases` 绑定名称分别为 `BUCKET` 和 `DB`，且 `database_id` 正确。

### 3. 照片上传后无法显示

- **原因**：R2 存储桶的公共读取权限未开启，或者 `R2_PUBLIC_URL` 配置不正确。
- **解决方法**：在 Cloudflare Dashboard 的 R2 存储桶设置中确保已启用 `r2.dev` 临时域名或绑定了自定义域，并将其完整 URL 配置到 `wrangler.jsonc` 中的 `R2_PUBLIC_URL`。
