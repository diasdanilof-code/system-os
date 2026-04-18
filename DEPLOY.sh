#!/bin/bash
# =============================================================
# System OS — deploy automation script
# =============================================================
# This script automates everything you can automate without
# cloud authentication. Run it inside the system-os/ folder.
#
# Usage on your Mac:
#   cd ~/Desktop/system-os
#   chmod +x DEPLOY.sh
#   ./DEPLOY.sh
# =============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}==> System OS deploy automation${NC}\n"

# 1. Check Node
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js not installed. Install from https://nodejs.org (LTS)${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Node $(node --version) detected"

# 2. Install dependencies
echo -e "\n${GREEN}==> Installing dependencies (~2-3 min)...${NC}"
npm install

# 3. Init git if not already
if [ ! -d ".git" ]; then
  echo -e "\n${GREEN}==> Initializing git repo...${NC}"
  git init -b main
fi

# 4. Git identity (only if missing globally)
if [ -z "$(git config --global user.email)" ]; then
  echo -e "\n${YELLOW}==> Setting git identity${NC}"
  git config --global user.name "Danilo Filho"
  git config --global user.email "diasdanilof@gmail.com"
fi

# 5. Stage + commit
echo -e "\n${GREEN}==> Committing code...${NC}"
git add .
git commit -m "System OS v1 — Dexie persistence + PWA" 2>/dev/null || echo "  (no changes to commit)"

# 6. Install Vercel CLI if missing
if ! command -v vercel &> /dev/null; then
  echo -e "\n${GREEN}==> Installing Vercel CLI (global)...${NC}"
  npm install -g vercel
fi

# 7. Vercel deploy (interactive — will open browser for auth)
echo -e "\n${GREEN}==> Deploying to Vercel${NC}"
echo -e "${YELLOW}   Vercel will open your browser to authenticate.${NC}"
echo -e "${YELLOW}   After auth, press ENTER to the prompts (defaults are fine).${NC}\n"

vercel --prod --yes

echo -e "\n${GREEN}✓ DONE${NC}"
echo -e "Your app is live. The URL is shown above."
echo -e "\nNext steps:"
echo -e "  1. Open the URL in Safari on your iPhone"
echo -e "  2. Tap Share → Add to Home Screen"
echo -e "  3. Use the app daily"
