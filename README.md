# 假发店推广管理系统

## Vercel 部署指南（推荐）

### 步骤 1：准备账号
1. 注册 [GitHub 账号](https://github.com)（免费）
2. 注册 [Vercel 账号](https://vercel.com)（免费，可用 GitHub 登录）

### 步骤 2：推送代码到 GitHub
1. 在 GitHub 创建新仓库（如 `hair-promotion`）
2. 将代码推送到 GitHub：
```bash
git init
git add .
git commit -m "初始化项目"
git branch -M main
git remote add origin https://github.com/你的用户名/hair-promotion.git
git push -u origin main
```

### 步骤 3：在 Vercel 部署
1. 登录 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择你的 GitHub 仓库
5. 配置环境变量（见下方）
6. 点击 "Deploy" 等待部署完成

### 步骤 4：配置环境变量
在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `COZE_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `COZE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ |
| `COZE_BUCKET_ENDPOINT_URL` | 对象存储 Endpoint | ❌ |
| `COZE_BUCKET_ACCESS_KEY` | 对象存储 Access Key | ❌ |
| `COZE_BUCKET_SECRET_KEY` | 对象存储 Secret Key | ❌ |
| `COZE_BUCKET_NAME` | 对象存储桶名称 | ❌ |
| `COZE_PROJECT_ENV` | 设为 `PROD` | ✅ |

### 步骤 5：获取访问地址
部署成功后，Vercel 会分配一个永久地址：
- 格式：`https://你的项目名.vercel.app`
- 可在 Vercel 设置中绑定自定义域名

---

## 功能说明

### 管理后台
- 地址：`/admin`
- 功能：管理推广者、推广内容、查看访客记录

### 推广者后台
- 地址：`/promoter/{推广码}`
- 功能：推广者查看自己的推广数据

### 推广落地页
- 地址：`/p/{推广码}`
- 功能：访客查看推广内容、留联系方式

---

## 技术栈
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Supabase 数据库
- S3 对象存储
- shadcn/ui 组件库
- Tailwind CSS 4
