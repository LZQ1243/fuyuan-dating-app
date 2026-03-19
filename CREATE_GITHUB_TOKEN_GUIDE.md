# GitHub Token 创建指南

## 🔐 为什么需要 Token？

GitHub 从 2021 年开始不再支持使用密码推送代码，必须使用 **Personal Access Token (PAT)**。

---

## 📋 步骤 1: 创建 GitHub Token

### 1. 登录 GitHub
访问: https://github.com/login
- 用户名: `LZQ1243`
- 密码: `3281698330@qq.com`

### 2. 进入设置页面
- 点击右上角头像
- 选择 **Settings** (设置)

### 3. 进入开发者设置
- 左侧菜单滚动到底部
- 点击 **Developer settings** (开发者设置)

### 4. 进入 Personal Access Tokens
- 左侧点击 **Personal access tokens** (个人访问令牌)
- 点击 **Tokens (classic)**

### 5. 生成新 Token
- 点击 **Generate new token** (生成新令牌)
- 选择 **Generate new token (classic)**

### 6. 配置 Token 权限
填写以下信息:

#### Note (备注)
```
fuyuan-dating-app - 推送代码
```

#### Expiration (过期时间)
选择: **No expiration** (永不过期) 或 **90 days** (90天)

#### Select scopes (选择权限)
勾选以下权限:
- ✅ **repo** (完整仓库访问权限)
  - repo:status
  - repo_deployment
  - public_repo
  - repo:invite
  - security_events

### 7. 生成 Token
- 滚动到底部
- 点击 **Generate token** (生成令牌)

### 8. 复制 Token
- Token 会显示为: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **立即复制并保存**（只显示一次！）
- 复制整个 Token

---

## 🚀 步骤 2: 使用 Token 推送代码

### 在命令行执行:

```bash
cd C:\Users\Administrator\Desktop\赴缘婚恋应用开发
git push -u origin main
```

### 输入凭据时:
- **Username**: `LZQ1243`
- **Password**: `粘贴刚才复制的 Token`（不是邮箱密码）

---

## ✅ 步骤 3: 推送成功

推送成功后会显示:
```
Enumerating objects: 463, done.
Counting objects: 100% (463/463), done.
Delta compression using up to 8 threads
Compressing objects: 100% (461/461), done.
Writing objects: 100% (463/463), XX.XX MiB | X.XX MiB/s, done.
Total 463 (delta 23), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (23/23), done.
To https://github.com/LZQ1243/fuyuan-dating-app.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

---

## 💡 重要提示

1. **保存 Token**: Token 只显示一次，请立即复制保存
2. **不要泄露**: Token 相当于密码，不要分享给他人
3. **定期更换**: 建议定期更新 Token
4. **妥善保管**: 将 Token 保存在安全的地方

---

## 🔧 常见问题

### Q: 输入密码后提示认证失败
A: 必须使用 Token，不能使用邮箱密码

### Q: Token 粘贴后看不到
A: 正常的，密码输入时不会显示字符

### Q: 推送失败提示权限不足
A: 检查 Token 是否勾选了 `repo` 权限

### Q: Token 忘记保存了
A: 需要重新生成新 Token

---

## 🎉 推送成功后

访问您的仓库: https://github.com/LZQ1243/fuyuan-dating-app

您将看到所有代码已经成功推送到 GitHub！
