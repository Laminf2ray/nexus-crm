#!/bin/bash
# ============================================================
# NexusCRM — GitHub Push & Setup Script
# Run this from your project root directory
# Usage: bash deploy-github.sh
# ============================================================

set -e  # Exit immediately on any error

# ── CONFIGURATION ────────────────────────────────────────────
REPO_NAME="nexus-crm"
GITHUB_USERNAME="Laminf2ray"       # ← FILL IN YOUR GITHUB USERNAME
BRANCH="main"
COMMIT_MSG="feat: initial NexusCRM release — lead tracking, pipeline kanban, email campaigns"

# ── COLOUR OUTPUT ─────────────────────────────────────────────
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Colour

echo -e "${BLUE}⚡ NexusCRM — GitHub Push Script${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── STEP 0: Check for username ────────────────────────────────
if [ -z "$GITHUB_USERNAME" ]; then
  echo -e "${YELLOW}Enter your GitHub username:${NC}"
  read -r GITHUB_USERNAME
fi

REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# ── STEP 1: Check prerequisites ───────────────────────────────
echo -e "\n${BLUE}[1/6] Checking prerequisites...${NC}"

if ! command -v git &> /dev/null; then
  echo -e "${RED}✗ Git not found. Install from https://git-scm.com${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Git found: $(git --version)${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node found: $(node --version)${NC}"

# ── STEP 2: Install dependencies & build ──────────────────────
echo -e "\n${BLUE}[2/6] Installing dependencies...${NC}"
npm install

echo -e "\n${BLUE}[3/6] Running production build...${NC}"
npm run build
echo -e "${GREEN}✓ Build successful → /dist${NC}"

# ── STEP 3: Initialise Git ────────────────────────────────────
echo -e "\n${BLUE}[4/6] Initialising Git repository...${NC}"

if [ -d ".git" ]; then
  echo -e "${YELLOW}  Git already initialised — skipping git init${NC}"
else
  git init
  echo -e "${GREEN}  ✓ Git initialised${NC}"
fi

# Set default branch to main
git checkout -b "$BRANCH" 2>/dev/null || git checkout "$BRANCH"

# ── STEP 4: Stage & commit ────────────────────────────────────
echo -e "\n${BLUE}[5/6] Staging files and committing...${NC}"

git add .
git status --short

git commit -m "$COMMIT_MSG" || echo -e "${YELLOW}  Nothing new to commit.${NC}"

echo -e "${GREEN}  ✓ Committed: \"$COMMIT_MSG\"${NC}"

# ── STEP 5: Push to GitHub ────────────────────────────────────
echo -e "\n${BLUE}[6/6] Pushing to GitHub...${NC}"
echo -e "  Repository: ${YELLOW}${REPO_URL}${NC}"
echo ""
echo -e "${YELLOW}⚠  Before continuing, make sure you have created the repository on GitHub:${NC}"
echo -e "   👉 https://github.com/new"
echo -e "   Name:     ${REPO_NAME}"
echo -e "   Visibility: Public or Private"
echo -e "   DO NOT initialise with README (we already have one)"
echo ""
echo -e "Press ENTER once the repository is created, or Ctrl+C to cancel..."
read -r

# Add or update remote
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REPO_URL"
  echo -e "${GREEN}  ✓ Remote 'origin' updated${NC}"
else
  git remote add origin "$REPO_URL"
  echo -e "${GREEN}  ✓ Remote 'origin' added${NC}"
fi

git push -u origin "$BRANCH"

# ── SUCCESS ───────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  🔗 Repository:  ${BLUE}https://github.com/${GITHUB_USERNAME}/${REPO_NAME}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  → Deploy to Vercel: https://vercel.com/new (import your GitHub repo)"
echo "  → Deploy to Netlify: https://app.netlify.com/start"
echo "  → Or run: npm run preview  to test production build locally"
echo ""
