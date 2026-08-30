#!/usr/bin/env bash
# ==============================================================================
# Weavly — Multi-Repository Unified Git Push & Sync Tool
# ==============================================================================
# Synchronizes the monorepo and its three component repositories:
# 1. Root Monorepo:  https://github.com/Ch-saketh/weavly.git
# 2. Client (UI):    https://github.com/Ch-saketh/weavly-client.git
# 3. Server (Java):  https://github.com/Ch-saketh/Weavly-render.git
# 4. Core (ML/Zyra): https://github.com/Ch-saketh/Zyra.git
# ==============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

COMMIT_MSG="${1:-"feat(sync): update latest changes across monorepo and sub-repos"}"

echo "======================================================================"
echo "🚀 SYNCING WEAVLY MULTI-REPOSITORY ECOSYSTEM TO GITHUB"
echo "======================================================================"
echo "Commit message: \"$COMMIT_MSG\""
echo "Root directory: $REPO_ROOT"
echo "----------------------------------------------------------------------"

# 1. Configure remotes if not already set
git remote add client https://github.com/Ch-saketh/weavly-client.git 2>/dev/null || git remote set-url client https://github.com/Ch-saketh/weavly-client.git
git remote add backend https://github.com/Ch-saketh/Weavly-render.git 2>/dev/null || git remote set-url backend https://github.com/Ch-saketh/Weavly-render.git
git remote add core https://github.com/Ch-saketh/Zyra.git 2>/dev/null || git remote set-url core https://github.com/Ch-saketh/Zyra.git
git remote add origin https://github.com/Ch-saketh/weavly.git 2>/dev/null || git remote set-url origin https://github.com/Ch-saketh/weavly.git

# 2. Stage and commit in root monorepo if there are changes
git add .
if ! git diff-index --quiet --cached HEAD 2>/dev/null; then
  echo "📦 [1/4] Committing changes in root monorepo..."
  git commit -m "$COMMIT_MSG"
else
  echo "📦 [1/4] No staged changes to commit."
fi

# 3. Push Root Monorepo to Origin
echo "📡 [2/4] Pushing to Monorepo (Ch-saketh/weavly)..."
git push origin main

# 4. Push weavly-client/LUXZERA/frontend -> weavly-client
echo "🎨 [3/4] Splitting and pushing Frontend -> (Ch-saketh/weavly-client)..."
git branch -D split-client 2>/dev/null || true
git subtree split --prefix=weavly-client/LUXZERA/frontend -b split-client
git push client split-client:main --force
git branch -D split-client 2>/dev/null || true

# 5. Push weavly-server/server -> Weavly-render
echo "⚙️ [4/4] Splitting and pushing Backend -> (Ch-saketh/Weavly-render)..."
git branch -D split-backend 2>/dev/null || true
git subtree split --prefix=weavly-server/server -b split-backend
git push backend split-backend:main --force
git branch -D split-backend 2>/dev/null || true

# 6. Push core-model -> Zyra
echo "🧠 [+] Splitting and pushing Zyra ML Core -> (Ch-saketh/Zyra)..."
git branch -D split-core 2>/dev/null || true
git subtree split --prefix=core-model -b split-core
git push core split-core:main --force
git branch -D split-core 2>/dev/null || true

echo "======================================================================"
echo "✅ ALL 4 REPOSITORIES ARE FULLY SYNCHRONIZED AND UP TO DATE!"
echo "   1. https://github.com/Ch-saketh/weavly"
echo "   2. https://github.com/Ch-saketh/weavly-client"
echo "   3. https://github.com/Ch-saketh/Weavly-render"
echo "   4. https://github.com/Ch-saketh/Zyra"
echo "======================================================================"
