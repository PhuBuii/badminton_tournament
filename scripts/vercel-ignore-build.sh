#!/bin/bash

# Exit code 1 = Cancel build (Vercel will skip deployment)
# Exit code 0 = Continue build

echo "🔍 Checking branch: $VERCEL_GIT_COMMIT_REF"

# Chỉ deploy branch main hoặc master
if [[ "$VERCEL_GIT_COMMIT_REF" == "main" ]] || [[ "$VERCEL_GIT_COMMIT_REF" == "master" ]]; then
  echo "✅ Branch allowed for deployment. Proceeding with build..."
  exit 1  # Build proceeds
else
  echo "❌ Branch '$VERCEL_GIT_COMMIT_REF' is not allowed. Skipping deployment..."
  exit 0  # Build cancelled
fi
