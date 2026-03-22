# Vercel 部署完整指南

## 项目概述

**假发推广落地页系统** - 支持推广者管理、访客留资、内容管理

### 技术栈
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui
- Supabase (数据库)
- S3 对象存储

---

## 第一步：准备工作

### 1.1 安装必要软件

1. **Node.js** (v18 以上)
   - 下载地址: https://nodejs.org
   - 安装后验证: `node -v`

2. **Git**
   - 下载地址: https://git-scm.com
   - 安装后验证: `git --version`

3. **代码编辑器** (推荐 VS Code)
   - 下载地址: https://code.visualstudio.com

### 1.2 注册必要账号

1. **GitHub** (免费)
   - 地址: https://github.com
   - 用于存放代码

2. **Vercel** (免费)
   - 地址: https://vercel.com
   - 用 GitHub 账号登录即可

3. **Supabase** (免费额度)
   - 地址: https://supabase.com
   - 用于数据库

---

## 第二步：本地创建项目

### 2.1 创建 Next.js 项目

```bash
# 创建项目
npx create-next-app@latest wig-promotion --typescript --tailwind --app --src-dir

# 进入项目目录
cd wig-promotion
```

创建时选择:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Turbopack: Yes
- Customize import alias: No

### 2.2 安装依赖

```bash
# 安装核心依赖
pnpm add @supabase/supabase-js qrcode lucide-react sonner class-variance-authority clsx tailwind-merge

# 安装 shadcn/ui
npx shadcn@latest init

# 安装 UI 组件
npx shadcn@latest add button card input label table tabs badge dialog alert textarea
```

---

## 第三步：复制代码文件

### 3.1 目录结构

```
wig-promotion/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── content/route.ts
│   │   │   │   ├── promoters/route.ts
│   │   │   │   ├── stats/route.ts
│   │   │   │   └── visitor-status/route.ts
│   │   │   ├── promoter/
│   │   │   │   └── [code]/route.ts
│   │   │   ├── visitor/route.ts
│   │   │   └── qrcode/route.ts
│   │   ├── p/
│   │   │   └── [code]/page.tsx
│   │   ├── promoter/
│   │   │   └── [code]/page.tsx
│   │   ├── admin/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/ui/
│   │   └── ... (shadcn组件)
│   ├── lib/
│   │   └── utils.ts
│   └── storage/database/
│       └── supabase-client.ts
├── public/
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### 3.2 关键文件说明

#### `src/storage/database/supabase-client.ts`
数据库连接文件，需要修改环境变量名称

#### `src/app/p/[code]/page.tsx`
落地页主文件，包含微信引导弹窗

#### `src/app/admin/page.tsx`
管理后台，管理推广者和内容

#### `src/app/api/` 目录
所有 API 接口

---

## 第四步：配置环境变量

### 4.1 创建 `.env.local` 文件

在项目根目录创建 `.env.local`:

```env
# Supabase 数据库配置（必需）
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥

# 对象存储配置（用于上传图片）
S3_ENDPOINT_URL=你的S3端点
S3_ACCESS_KEY=你的访问密钥
S3_SECRET_KEY=你的密钥
S3_BUCKET_NAME=你的桶名
```

### 4.2 获取 Supabase 配置

1. 登录 Supabase Dashboard
2. 选择项目 → Settings → API
3. 复制:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 第五步：修改代码适配 Vercel

### 5.1 修改数据库连接文件

编辑 `src/storage/database/supabase-client.ts`:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export { getSupabaseClient };
```

### 5.2 修改内容 API 的存储配置

编辑 `src/app/api/admin/content/route.ts`，修改 S3 配置：

```typescript
// 替换为你的 S3 配置方式
const s3Config = {
  endpoint: process.env.S3_ENDPOINT_URL,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
  bucket: process.env.S3_BUCKET_NAME,
};
```

---

## 第六步：创建数据库表

### 6.1 在 Supabase SQL Editor 中执行

```sql
-- 推广者表
CREATE TABLE promoters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  wechat VARCHAR(50),
  unique_code VARCHAR(10) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 推广内容表
CREATE TABLE promotion_contents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  store_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 访客记录表
CREATE TABLE visitor_records (
  id SERIAL PRIMARY KEY,
  promoter_id INTEGER REFERENCES promoters(id),
  wechat_id VARCHAR(50),
  ip_address VARCHAR(50),
  user_agent TEXT,
  referrer TEXT,
  wechat_status VARCHAR(20),
  deal_status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_promoters_code ON promoters(unique_code);
CREATE INDEX idx_visitor_promoter ON visitor_records(promoter_id);
CREATE INDEX idx_visitor_wechat ON visitor_records(wechat_id);
```

---

## 第七步：本地测试

```bash
# 安装依赖
pnpm install

# 运行开发服务器
pnpm dev
```

访问 http://localhost:3000 测试功能

---

## 第八步：推送到 GitHub

### 8.1 创建 GitHub 仓库

1. 登录 GitHub
2. 点击 "New repository"
3. 名称: `wig-promotion`
4. 选择 Private 或 Public
5. 点击 "Create repository"

### 8.2 推送代码

```bash
# 初始化 Git
git init
git add .
git commit -m "Initial commit: 假发推广系统"

# 关联远程仓库
git remote add origin https://github.com/你的用户名/wig-promotion.git
git branch -M main
git push -u origin main
```

---

## 第九步：Vercel 部署

### 9.1 导入项目

1. 登录 Vercel (用 GitHub 登录)
2. 点击 "New Project"
3. 选择 `wig-promotion` 仓库
4. 点击 "Import"

### 9.2 配置环境变量

在 Vercel 项目设置中添加:

| 变量名 | 值 |
|--------|---|
| NEXT_PUBLIC_SUPABASE_URL | 你的Supabase URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | 你的Supabase Key |
| S3_ENDPOINT_URL | 你的S3端点 |
| S3_ACCESS_KEY | 你的访问密钥 |
| S3_SECRET_KEY | 你的密钥 |
| S3_BUCKET_NAME | 你的桶名 |

### 9.3 部署

1. 点击 "Deploy"
2. 等待构建完成
3. 访问分配的域名

---

## 第十步：绑定自定义域名（可选）

### 10.1 购买域名

- 阿里云: https://wanwang.aliyun.com
- 腾讯云: https://cloud.tencent.com

### 10.2 在 Vercel 绑定

1. 项目 Settings → Domains
2. 输入你的域名
3. 按提示配置 DNS

### 10.3 配置 DNS 解析

在域名服务商添加 CNAME 记录:
- 主机记录: `@` 或 `www`
- 记录类型: CNAME
- 记录值: `cname.vercel-dns.com`

---

## 常见问题

### Q: 部署失败怎么办？
A: 查看 Vercel 构建日志，通常是依赖或类型错误

### Q: 数据库连接失败？
A: 检查环境变量是否正确配置

### Q: 图片上传失败？
A: 检查 S3 配置和网络访问

---

## 费用说明

| 服务 | 费用 |
|------|------|
| Vercel | 免费（Hobby计划） |
| Supabase | 免费（500MB数据库） |
| GitHub | 免费 |
| 域名 | 约 50-100元/年（可选） |
| **总计** | **0元/月**（不含域名） |

---

## 需要帮助？

如果遇到问题，可以：
1. 检查 Vercel 部署日志
2. 检查 Supabase 表结构
3. 确认环境变量配置正确
