# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automating package publishing and version management.

## Workflows

### 1. Publish to npm (`publish.yml`)

**Triggers:**
- Push to `main` branch
- Manual trigger via workflow_dispatch

**What it does:**
1. **Test Stage**: Runs tests and linting to ensure quality
2. **Publish Stage**: 
   - Only runs if tests pass
   - Checks if the current version already exists on npm
   - If version is new, publishes to npm
   - Creates a git tag
   - Creates a GitHub release
3. **Notify Stage**: Provides success/failure notifications

**Requirements:**
- `NPM_TOKEN` secret must be set in repository secrets
- Version in `package.json` must be bumped before pushing

### 2. Version Bump (`version-bump.yml`)

**Triggers:**
- Manual trigger only (workflow_dispatch)

**What it does:**
1. Allows you to choose version bump type (patch/minor/major) or specify custom version
2. Updates `package.json` version
3. Runs tests to ensure everything still works
4. Builds the package to verify
5. Commits and pushes the version change
6. Automatically triggers the publish workflow

## Setup Instructions

### 1. Create npm Token

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Click on your profile → "Access Tokens"
3. Click "Generate New Token" → "Automation"
4. Copy the token

### 2. Add Repository Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click "Add secret"

### 3. Usage

#### Option A: Automatic (Recommended)
1. Use the Version Bump workflow to bump version:
   - Go to Actions tab in GitHub
   - Click "Version Bump" workflow
   - Click "Run workflow"
   - Choose version type (patch/minor/major)
   - This will automatically trigger publishing

#### Option B: Manual
1. Bump version manually: `npm version patch/minor/major`
2. Push to main branch: `git push origin main`
3. Publishing workflow will run automatically

## Workflow Features

### Smart Version Detection
- Only publishes if the version doesn't already exist on npm
- Prevents accidental duplicate publishes

### Quality Gates
- Tests must pass before publishing
- Linting must pass before publishing
- Build must succeed before publishing

### Automatic Releases
- Creates git tags for each published version
- Creates GitHub releases with changelog links
- Links to npm package page

### Error Handling
- Clear error messages if workflows fail
- Continues to run other jobs even if one fails
- Notifications for both success and failure cases

## Troubleshooting

### Common Issues

1. **"npm ERR! 403 Forbidden"**
   - Check that NPM_TOKEN is correctly set in repository secrets
   - Ensure your npm token has "Automation" permissions

2. **"Version already exists"**
   - This is normal behavior - workflow skips publishing existing versions
   - Use version bump workflow to create a new version

3. **Tests failing**
   - Fix tests before attempting to publish
   - Workflow will not publish if tests fail

4. **Build failing**
   - Check TypeScript errors
   - Ensure all dependencies are properly installed
