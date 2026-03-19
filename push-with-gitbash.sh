#!/bin/bash
# 赴缘婚恋项目推送脚本 - 使用 Git Bash

echo "=========================================="
echo "赴缘婚恋项目 - Git 推送工具"
echo "=========================================="
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 检查 Git 状态
echo "[1/4] 检查 Git 状态..."
git status --short

echo ""
echo "[2/4] 添加所有文件到暂存区..."
git add .

# 获取当前分支名
current_branch=$(git rev-parse --abbrev-ref HEAD)

echo ""
echo "[3/4] 提交更改..."
# 检查是否有更改需要提交
if git diff --cached --quiet; then
    echo "没有新的更改需要提交"
else
    # 检查是否有未跟踪的文件
    if git ls-files --others --exclude-standard | grep -q .; then
        commit_msg="feat: 新增文件和优化 - $(date '+%Y-%m-%d %H:%M:%S')

- 修复 TypeScript 类型错误
- 恢复 vite-env.d.ts 和 react.d.ts
- 优化 Vite 配置
- 更新项目配置"
    else
        commit_msg="fix: 修复 TypeScript 错误和优化配置 - $(date '+%Y-%m-%d %H:%M:%S')

- 修复 App.tsx 中的类型错误
- 修复 vite.config.ts 的 manualChunks 配置
- 恢复必要的类型声明文件"
    fi
    
    git commit -m "$commit_msg"
    echo "✅ 提交成功"
fi

echo ""
echo "[4/4] 推送到 GitHub..."
# 尝试推送到当前分支
if git push origin "$current_branch"; then
    echo ""
    echo "=========================================="
    echo "✅ 推送成功！"
    echo "=========================================="
    echo "仓库地址: https://github.com/LZQ1243/fuyuan-dating-app.git"
else
    echo ""
    echo "=========================================="
    echo "❌ 推送失败！"
    echo "=========================================="
    echo ""
    echo "可能的解决方案："
    echo "1. 如果是第一次推送，请运行："
    echo "   git push -u origin $current_branch"
    echo ""
    echo "2. 如果需要设置上游分支："
    echo "   git branch --set-upstream-to=origin/$current_branch $current_branch"
    echo ""
    echo "3. 如果有冲突，请先拉取："
    echo "   git pull origin $current_branch --rebase"
    echo "   然后再推送"
    echo ""
    echo "4. 如果需要身份验证，请使用："
    echo "   git config --global credential.helper store"
    echo ""
fi

echo ""
read -p "按任意键退出..."
