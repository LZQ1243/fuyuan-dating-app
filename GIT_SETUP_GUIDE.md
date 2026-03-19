# Git 仓库配置指南

## 📋 当前状态

✅ Git 仓库已初始化
✅ .gitignore 文件已创建

---

## 🔗 添加远程仓库

### 方式一: 使用 GitHub

```bash
# 1. 在 GitHub 创建新仓库
# 访问: https://github.com/new

# 2. 添加远程仓库
git remote add origin https://github.com/your-username/fuyuan-dating-app.git

# 3. 验证远程仓库
git remote -v
```

### 方式二: 使用 Gitee (码云)

```bash
# 1. 在 Gitee 创建新仓库
# 访问: https://gitee.com/projects/new

# 2. 添加远程仓库
git remote add origin https://gitee.com/your-username/fuyuan-dating-app.git

# 3. 验证远程仓库
git remote -v
```

### 方式三: 使用 GitLab

```bash
# 1. 在 GitLab 创建新仓库
# 访问: https://gitlab.com/projects/new

# 2. 添加远程仓库
git remote add origin https://gitlab.com/your-username/fuyuan-dating-app.git

# 3. 验证远程仓库
git remote -v
```

### 方式四: 使用 SSH (推荐)

```bash
# 1. 生成 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 2. 添加 SSH 密钥到 GitHub/Gitee/GitLab

# 3. 使用 SSH 添加远程仓库
git remote add origin git@github.com:your-username/fuyuan-dating-app.git
```

---

## 📤 推送到远程仓库

### 首次推送

```bash
# 1. 查看当前状态
git status

# 2. 添加所有文件
git add .

# 3. 提交更改
git commit -m "初始化项目"

# 4. 推送到远程仓库
git push -u origin master
# 或使用 main 分支
git push -u origin main
```

### 后续更新

```bash
# 1. 添加更改的文件
git add .

# 2. 提交更改
git commit -m "更新描述"

# 3. 推送到远程
git push
```

---

## 🔀 分支管理

### 查看分支

```bash
# 查看所有分支
git branch -a

# 查看当前分支
git branch
```

### 创建分支

```bash
# 创建新分支
git branch feature/new-feature

# 切换到新分支
git checkout feature/new-feature

# 或使用一条命令
git checkout -b feature/new-feature
```

### 合并分支

```bash
# 切换到主分支
git checkout master

# 合并分支
git merge feature/new-feature

# 删除已合并的分支
git branch -d feature/new-feature
```

---

## 🏷️ 版本标签

### 创建标签

```bash
# 创建轻量标签
git tag v1.0.0

# 创建带注释的标签
git tag -a v1.0.0 -m "第一个正式版本"
```

### 推送标签

```bash
# 推送单个标签
git push origin v1.0.0

# 推送所有标签
git push origin --tags
```

### 查看标签

```bash
# 查看所有标签
git tag

# 查看标签详情
git show v1.0.0
```

---

## 🔄 常用命令

### 查看状态

```bash
# 查看当前状态
git status

# 查看提交历史
git log

# 查看简洁的提交历史
git log --oneline

# 查看文件修改
git diff
```

### 撤销操作

```bash
# 撤销工作区的修改
git checkout -- file.txt

# 撤销暂存区的修改
git reset HEAD file.txt

# 撤销最后一次提交
git reset --soft HEAD~1

# 撤销并保留修改
git reset --soft HEAD~1

# 撤销并删除修改
git reset --hard HEAD~1
```

### 拉取更新

```bash
# 拉取远程更新
git pull origin master

# 获取远程更新但不合并
git fetch origin

# 拉取并变基
git pull --rebase origin master
```

---

## 🛠️ 解决冲突

### 发生冲突时

```bash
# 1. 查看冲突文件
git status

# 2. 手动编辑冲突文件
# 标记为:
# <<<<<<< HEAD
# 你的修改
# =======
# 远程的修改
# >>>>>>> origin/master

# 3. 解决冲突后,标记为已解决
git add file.txt

# 4. 提交
git commit -m "解决冲突"

# 5. 推送
git push
```

---

## 🔐 配置用户信息

```bash
# 配置用户名
git config user.name "Your Name"

# 配置邮箱
git config user.email "your-email@example.com"

# 配置全局用户名
git config --global user.name "Your Name"

# 配置全局邮箱
git config --global user.email "your-email@example.com"
```

---

## 📚 推荐工作流

### 1. 功能开发流程

```bash
# 1. 从主分支创建功能分支
git checkout -b feature/new-feature

# 2. 开发并提交
git add .
git commit -m "添加新功能"

# 3. 推送到远程
git push -u origin feature/new-feature

# 4. 在 GitHub/Gitee 创建 Pull Request

# 5. 合并后更新主分支
git checkout master
git pull origin master
git branch -d feature/new-feature
```

### 2. 修复 Bug 流程

```bash
# 1. 创建修复分支
git checkout -b bugfix/fix-bug

# 2. 修复并提交
git add .
git commit -m "修复Bug"

# 3. 推送并创建 Pull Request
git push -u origin bugfix/fix-bug

# 4. 合并后更新主分支
git checkout master
git pull origin master
```

---

## 💡 最佳实践

1. **提交信息**: 使用清晰的提交信息
   - ✅ `feat: 添加用户登录功能`
   - ✅ `fix: 修复数据库连接错误`
   - ✅ `docs: 更新部署文档`
   - ❌ `update`

2. **提交频率**: 频繁提交,小步快跑
   - 每完成一个功能就提交
   - 每修复一个 Bug 就提交

3. **分支管理**: 使用功能分支
   - 主分支保持稳定
   - 新功能在分支开发
   - 使用 Pull Request 合并

4. **代码审查**: 使用 Pull Request
   - 代码审查提高质量
   - 知识分享和学习
   - 减少错误和问题

---

## 🎉 完成

现在您的 Git 仓库已经配置完成,可以开始使用了!

- ✅ Git 仓库已初始化
- ✅ .gitignore 已配置
- ✅ 添加远程仓库
- ✅ 开始开发并提交代码

祝您使用愉快! 🚀
