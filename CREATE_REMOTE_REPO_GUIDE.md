# 远程仓库创建指南

## 方式一: GitHub (推荐)

### 步骤:

1. **访问 GitHub**: https://github.com/new

2. **填写仓库信息**:
   - 仓库名称: `fuyuan-dating-app`
   - 描述: `赴缘婚恋社交平台 - 全栈开发项目`
   - 可见性: Public (公开) 或 Private (私有)
   - **重要**: 勾选 "Add a README file"
   - **重要**: 勾选 "Choose .gitignore" → 选择 Node
   - **重要**: 勾选 "Choose a license" → 选择 MIT

3. **创建仓库**: 点击 "Create repository"

4. **获取仓库地址**:
   ```
   https://github.com/your-username/fuyuan-dating-app.git
   ```

### 推送代码到 GitHub:

```bash
# 添加远程仓库
git remote add origin https://github.com/your-username/fuyuan-dating-app.git

# 推送到远程
git push -u origin main
```

---

## 方式二: Gitee (码云) - 国内推荐

### 步骤:

1. **访问 Gitee**: https://gitee.com/projects/new

2. **填写仓库信息**:
   - 仓库名称: `fuyuan-dating-app`
   - 仓库介绍: `赴缘婚恋社交平台 - 全栈开发项目`
   - 可见度: 公开 或 私有
   - **重要**: 勾选 "使用 .gitignore 模板" → Node
   - **重要**: 勾选 "添加开源许可证" → MIT

3. **创建仓库**: 点击 "创建"

4. **获取仓库地址**:
   ```
   https://gitee.com/your-username/fuyuan-dating-app.git
   ```

### 推送代码到 Gitee:

```bash
# 添加远程仓库
git remote add origin https://gitee.com/your-username/fuyuan-dating-app.git

# 推送到远程
git push -u origin main
```

---

## 方式三: GitLab

### 步骤:

1. **访问 GitLab**: https://gitlab.com/projects/new

2. **填写仓库信息**:
   - 项目名称: `fuyuan-dating-app`
   - 描述: `赴缘婚恋社交平台 - 全栈开发项目`
   - 可见性: Public 或 Private
   - **重要**: 勾选 "Initialize repository with a README"
   - **重要**: 添加 .gitignore → Node
   - **重要**: 添加 License → MIT

3. **创建仓库**: 点击 "Create project"

4. **获取仓库地址**:
   ```
   https://gitlab.com/your-username/fuyuan-dating-app.git
   ```

### 推送代码到 GitLab:

```bash
# 添加远程仓库
git remote add origin https://gitlab.com/your-username/fuyuan-dating-app.git

# 推送到远程
git push -u origin main
```

---

## 🚀 快速推送命令模板

将以下命令中的 `your-username` 替换为您的用户名,然后执行:

### GitHub:
```bash
git remote add origin https://github.com/your-username/fuyuan-dating-app.git
git push -u origin main
```

### Gitee:
```bash
git remote add origin https://gitee.com/your-username/fuyuan-dating-app.git
git push -u origin main
```

### GitLab:
```bash
git remote add origin https://gitlab.com/your-username/fuyuan-dating-app.git
git push -u origin main
```

---

## 💡 推荐选择

- **国内用户**: 推荐使用 **Gitee**,速度快,访问稳定
- **国际项目**: 推荐使用 **GitHub**,全球知名度高
- **企业项目**: 推荐使用 **GitLab**,功能强大

---

## 📝 注意事项

1. **首次推送** 可能需要登录账号
2. **私有仓库** 需要权限验证
3. **大文件推送** 可能较慢,请耐心等待
4. **推送失败** 检查网络连接和仓库地址

---

## 🎉 完成后

推送成功后,您将拥有:
- ✅ 完整的代码备份
- ✅ 版本历史记录
- ✅ 协作开发平台
- ✅ CI/CD 自动部署能力

祝您使用愉快! 🚀
