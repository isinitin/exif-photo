# Exif Photo Deployment Guide

This guide will help you deploy the Exif Photo project to Cloudflare. The project is built on **SvelteKit** and uses **Cloudflare Workers (with Assets)** for hosting, **Cloudflare D1** for the database, **Cloudflare R2** for object storage, and **Better Auth** for authentication.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Cloudflare Resources Creation](#cloudflare-resources-creation)
   - [1. Create D1 Database](#1-create-d1-database)
   - [2. Create R2 Bucket](#2-create-r2-bucket)
   - [3. Obtain API Credentials](#3-obtain-api-credentials)
3. [Project Configuration](#project-configuration)
   - [1. Configure `wrangler.jsonc`](#1-configure-wranglerjsonc)
   - [2. Configure `.env` Environment Variables](#2-configure-env-environment-variables)
4. [Database Schema Migrations](#database-schema-migrations)
   - [1. Generate Migration Files](#1-generate-migration-files)
   - [2. Initialize Local Development Database](#2-initialize-local-development-database)
   - [3. Initialize Production (Remote D1) Database](#3-initialize-production-remote-d1-database)
5. [Configure Production Secrets and Variables](#configure-production-secrets-and-variables)
6. [Build and Deploy](#build-and-deploy)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, make sure you have:
- **Node.js** (v20 or higher recommended)
- **npm** package manager
- A **Cloudflare Account** (with D1 and R2 enabled)
- Authenticated the CLI with your Cloudflare account:
  ```bash
  npx wrangler login
  ```

---

## Cloudflare Resources Creation

### 1. Create D1 Database
Create a new D1 database by running:
```bash
npx wrangler d1 create exif-photo
```
Once created successfully, the terminal will output details like:
```text
✅ Successfully created database 'exif-photo' on account <YOUR_ACCOUNT_ID>
Created database exif-photo with ID <YOUR_DATABASE_ID>
```
**Keep a record of the `database_id`**; you will need it later.

### 2. Create R2 Bucket
Create the R2 bucket for photo storage:
```bash
npx wrangler r2 bucket create exif-photo
```
Once created, configure **Public Access** for the bucket in the Cloudflare Dashboard, or bind a custom domain:
- **Custom Domain (Recommended)**: Under `Settings` -> `Public Access` for the R2 bucket, connect your custom domain (e.g., `assets.yourdomain.com`).
- **R2.dev Subdomain**: Under `Settings` -> `Public Access`, enable the temporary `r2.dev` subdomain.

### 3. Obtain API Credentials
To allow local Drizzle Kit CLI commands to interact with the remote D1 database via HTTP, obtain the following credentials:
1. **Cloudflare Account ID**: Found on the right side of the Workers & Pages dashboard.
2. **Database ID**: The ID of the D1 database created in Step 1.
3. **Cloudflare D1 Token (API Token)**:
   - Go to [Cloudflare API Tokens page](https://dash.cloudflare.com/profile/api-tokens).
   - Click **Create Token**.
   - Use the **Read and write Cloudflare D1** template (or create a custom token with `Account -> D1 -> Edit` permissions).
   - Generate and copy the token.

---

## Project Configuration

### 1. Configure `wrangler.jsonc`
Edit [wrangler.jsonc](file:///Users/abiee/Codes/exif-photo/wrangler.jsonc) in the root directory to configure bindings and the database ID:

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
		"R2_PUBLIC_URL": "https://<YOUR_R2_PUBLIC_DOMAIN_OR_R2_DEV_SUBDOMAIN>" // e.g., https://assets.yourdomain.com
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
			"database_id": "<YOUR_D1_DATABASE_ID>", // Paste D1 database_id here
			"migrations_dir": "./drizzle"
		}
	]
}
```

### 2. Configure `.env` Environment Variables
Create or edit the `.env` file in the root directory. **This file is used for local development and Drizzle Kit migration tools**:

```env
# Cloudflare D1 remote management credentials (used by drizzle-kit)
CLOUDFLARE_ACCOUNT_ID="your_cloudflare_account_id"
CLOUDFLARE_DATABASE_ID="your_d1_database_id"
CLOUDFLARE_D1_TOKEN="your_cloudflare_d1_token"

# Canonical URL for production or local development
ORIGIN="https://your-app-domain.pages.dev" # Can be updated with the deployed URL later; for local development, use http://localhost:5173

# Better Auth Secret (Must be a 32-character high-entropy random string)
# Generate one using `npx better-auth secret` or `openssl rand -hex 16`
BETTER_AUTH_SECRET="your_32_character_random_string"
```

---

## Database Schema Migrations

### 1. Generate Migration Files
Drizzle Kit reads the schema defined in `src/lib/server/db/schema.ts` and generates corresponding SQL migration files:
```bash
npm run db:generate
```
This generates the migration files inside the `./drizzle` directory.

### 2. Initialize Local Development Database
If you are running the project locally, apply migrations to the local simulated D1 database instance:
```bash
npm run db:local
```
*(This maps to `npx wrangler d1 migrations apply DB --local`)*

### 3. Initialize Production (Remote D1) Database
Apply migrations to your live Cloudflare D1 database:
```bash
npm run db:remote
```
*(This maps to `npx wrangler d1 migrations apply DB --remote`)*

---

## Configure Production Secrets and Variables

Cloudflare Workers do not read local `.env` files for secrets in production. You must configure these through the Wrangler CLI or Cloudflare dashboard:

### 1. Upload Better Auth Secret
Store the auth secret securely in Cloudflare:
```bash
npx wrangler secret put BETTER_AUTH_SECRET
```
Paste the value of the `BETTER_AUTH_SECRET` generated earlier when prompted.

### 2. Configure Production ORIGIN
`Better Auth` requires the `ORIGIN` environment variable to match the canonical URL of the deployed application. You can set this in one of two ways:

- **Option A: Via the Cloudflare Dashboard (Recommended)**
  1. Log in to your Cloudflare Dashboard.
  2. Navigate to `Workers & Pages` -> click your project `exif-photo`.
  3. Go to `Settings` -> `Variables`.
  4. Under `Environment Variables`, click **Add variable**, enter key `ORIGIN` and value (e.g., `https://exif-photo.pages.dev` or your custom domain).

- **Option B: Inside `wrangler.jsonc`**
  Add the variable directly in the `vars` object in `wrangler.jsonc`. **Note that this value will be exposed if your codebase is public.**

---

## Build and Deploy

Once everything is configured, build the application and deploy it:

### 1. Build the App
```bash
npm run build
```
This creates the Worker script and assets compiled for Cloudflare inside the `.svelte-kit/cloudflare` directory.

### 2. Deploy to Cloudflare
```bash
npx wrangler deploy
```
Wrangler will upload the compiled SvelteKit worker script and static assets to Cloudflare.

Upon success, it will output the URL of your deployed application (e.g., `https://exif-photo.<your-subdomain>.workers.dev`).

---

## Troubleshooting

### 1. Better Auth CORS / Redirect Errors during sign-in
- **Cause**: The `ORIGIN` variable is missing, or does not match the URL you are using to access the app.
- **Solution**: Verify that `ORIGIN` is configured in your Cloudflare dashboard environment variables and contains the `https://` protocol prefix without a trailing slash.

### 2. Runtime Error: `D1 binding "DB" not found` or `R2 binding "BUCKET" not found`
- **Cause**: Running the built project locally without Wrangler's simulation environment, or bindings are misconfigured.
- **Solution**:
  - Run `npm run preview` to preview production builds locally (it runs wrangler simulator internally).
  - Check that the `d1_databases` and `r2_buckets` bindings in `wrangler.jsonc` match `DB` and `BUCKET` names exactly.

### 3. Uploaded Photos Do Not Load/Display
- **Cause**: R2 bucket public access is disabled, or the `R2_PUBLIC_URL` variable is incorrect.
- **Solution**: Make sure the R2 bucket public access or custom domain is enabled on the Cloudflare Dashboard, and the `R2_PUBLIC_URL` variable in `wrangler.jsonc` points to the correct endpoint.
