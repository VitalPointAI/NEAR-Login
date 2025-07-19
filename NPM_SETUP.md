# Setting up npm Token for Automated Publishing

To complete the setup of automated npm publishing, you need to add an NPM_TOKEN to your GitHub repository secrets.

## Step 1: Create npm Access Token

1. Go to [npmjs.com](https://www.npmjs.com) and log in to your account
2. Click on your profile picture (top right) → **"Access Tokens"**
3. Click **"Generate New Token"** 
4. Select **"Automation"** as the token type (this gives publish permissions)
5. Add a description like "GitHub Actions - @vitalpointai/near-login"
6. Click **"Generate Token"**
7. **Copy the token immediately** (you won't be able to see it again)

## Step 2: Add Token to GitHub Repository

1. Go to your GitHub repository: https://github.com/VitalPointAI/NEAR-Login
2. Click **"Settings"** tab
3. In the left sidebar, click **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"**
5. Set:
   - **Name**: `NPM_TOKEN`
   - **Secret**: Paste your npm token from step 1
6. Click **"Add secret"**

## Step 3: Test the Setup

### Option A: Use Version Bump Workflow (Recommended)
1. Go to **"Actions"** tab in your GitHub repository
2. Click on **"Version Bump"** workflow
3. Click **"Run workflow"** button
4. Choose **"patch"** for version type (this will bump from 1.0.0 → 1.0.1)
5. Click **"Run workflow"**

This will:
- Bump the version in package.json
- Run tests to ensure quality
- Commit and push the version change
- Automatically trigger the publish workflow
- Publish to npm if tests pass

### Option B: Manual Version Bump
1. Locally run: `npm version patch` (or `minor`/`major`)
2. Push to main: `git push origin main`
3. The publish workflow will trigger automatically

## Verification

After running either option:
1. Check the **"Actions"** tab to see workflow progress
2. Verify your package appears on npm: https://www.npmjs.com/package/@vitalpointai/near-login
3. Check that a new GitHub release was created automatically

## Troubleshooting

- **403 Forbidden**: Check that your NPM_TOKEN secret is set correctly
- **Version exists**: Normal behavior - workflow skips existing versions
- **Tests failing**: Fix tests before publishing (workflow won't publish if tests fail)

## Future Publishing

Once set up, you can publish new versions by:
1. Using the **"Version Bump"** workflow in GitHub Actions (recommended)
2. Or manually bumping version and pushing to main branch

The workflow automatically handles testing, building, publishing, and creating releases!
