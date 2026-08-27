#!/usr/bin/env bash
# ==============================================================================
# Weavly — Multi-Repository Unified Sync Tool
# Author: Saketh Chokkapu
# ==============================================================================
# Synchronizes the monorepo and its three component repositories:
# 1. Root Monorepo:  https://github.com/Ch-saketh/weavly.git
# 2. Client (UI):    https://github.com/Ch-saketh/weavly-public.git
# 3. Server (Java):  https://github.com/Ch-saketh/Weavly-render.git
# 4. Core (ML/Zyra): https://github.com/Ch-saketh/Zyra.git
# ==============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

COMMIT_MSG="${1:-"sync: update latest code across monorepo and sub-repos"}"

echo "======================================================================"
echo "🚀 SYNCING WEAVLY MULTI-REPOSITORY ECOSYSTEM"
echo "======================================================================"

# 1. Ensure remotes are configured
git remote add client https://github.com/Ch-saketh/weavly-public.git 2>/dev/null || git remote set-url client https://github.com/Ch-saketh/weavly-public.git
git remote add backend https://github.com/Ch-saketh/Weavly-render.git 2>/dev/null || git remote set-url backend https://github.com/Ch-saketh/Weavly-render.git
git remote add core https://github.com/Ch-saketh/Zyra.git 2>/dev/null || git remote set-url core https://github.com/Ch-saketh/Zyra.git
git remote add origin https://github.com/Ch-saketh/weavly.git 2>/dev/null || git remote set-url origin https://github.com/Ch-saketh/weavly.git

# 2. Stage and commit in root monorepo if there are changes
if [[ -n $(git status -s) ]]; then
  echo "📦 Committing changes in root monorepo..."
  git add .
  git commit -m "$COMMIT_MSG"
fi

# 3. Push Root Monorepo
echo "📡 Pushing to main monorepo (Ch-saketh/weavly)..."
git push origin main

# 4. Push weavly-client -> weavly-public
echo "🎨 Pushing weavly-client -> (Ch-saketh/weavly-public)..."
git branch -D split-client 2>/dev/null || true
git subtree split --prefix=weavly-client -b split-client
git push client split-client:main --force
git branch -D split-client 2>/dev/null || true

# 5. Push weavly-server -> Weavly-render
echo "⚙️ Pushing weavly-server -> (Ch-saketh/Weavly-render)..."
git branch -D split-backend 2>/dev/null || true
git subtree split --prefix=weavly-server -b split-backend
git push backend split-backend:main --force
git branch -D split-backend 2>/dev/null || true

# 6. Push core-model -> Zyra
echo "🧠 Pushing core-model -> (Ch-saketh/Zyra)..."
git branch -D split-core 2>/dev/null || true
git subtree split --prefix=core-model -b split-core
git push core split-core:main --force
git branch -D split-core 2>/dev/null || true

echo "======================================================================"
echo "✅ ALL 4 REPOSITORIES ARE FULLY SYNCHRONIZED AND UP TO DATE!"
echo "======================================================================"
