# 🐳 Docker Hub Setup Guide for uptime-kuma-vn

This guide will help you set up automatic Docker image building and pushing using GitHub Actions.

## 📋 Prerequisites

1. **Docker Hub Account**: [Create one here](https://hub.docker.com/)
2. **GitHub Account**: You already have this
3. **Repository Access**: You have push access to `hienhoceo-dpsmedia/uptime-kuma-vn`

## 🔧 Step-by-Step Setup

### Step 1: Create Docker Hub Repository

1. Go to [Docker Hub](https://hub.docker.com/)
2. Click **"Create Repository"**
3. Fill in the details:
   - **Namespace**: `hienhoceo-dpsmedia`
   - **Repository Name**: `uptime-kuma-vn`
   - **Visibility**: Public (recommended)
   - **Description**: "Enhanced Uptime Kuma with CSV import and queue monitor limit features"
4. Click **"Create"**

### Step 2: Generate Docker Hub Access Token

1. Log in to [Docker Hub](https://hub.docker.com/)
2. Click on your **profile picture** → **Account Settings**
3. Click **"Security"** in the left menu
4. Click **"New Access Token"**
5. Fill in the details:
   - **Token name**: `GitHub Actions`
   - **Description**: `Access token for GitHub Actions CI/CD`
6. Click **"Generate"**
7. **⚠️ IMPORTANT**: Copy the generated token immediately and save it somewhere safe. You won't be able to see it again!

### Step 3: Add Secrets to GitHub Repository

1. Go to your GitHub repository: https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn
2. Click **"Settings"** tab
3. Click **"Secrets and variables"** → **"Actions"** in the left menu
4. Click **"New repository secret"**
5. Add the following secrets:

#### Secret 1: DOCKER_USERNAME
- **Name**: `DOCKER_USERNAME`
- **Secret**: Your Docker Hub username (e.g., `hienhoceo-dpsmedia`)

#### Secret 2: DOCKER_PASSWORD
- **Name**: `DOCKER_PASSWORD`
- **Secret**: The Docker Hub access token you generated in Step 2

### Step 4: Trigger the Build

The GitHub Actions workflow is now set up to automatically build and push your Docker image when:

- You **push to master branch** → Builds and pushes `:latest` tag
- You **create a release** → Builds and pushes versioned tags
- You **create a pull request** → Builds image (for testing) but doesn't push

#### To trigger the first build:

1. **Push any change** to the repository (like updating this README)
2. Go to the **"Actions"** tab in your GitHub repository
3. Click on the **"Build and Push Docker Image"** workflow
4. Watch the build progress

## 🚀 Quick Test

Once the workflow completes successfully:

1. **Verify the image on Docker Hub**:
   - Go to: https://hub.docker.com/r/hienhoceo-dpsmedia/uptime-kuma-vn
   - You should see your image with tags

2. **Test the image locally**:
   ```bash
   # Pull the image
   docker pull hienhoceo-dpsmedia/uptime-kuma-vn:latest

   # Run a test container
   docker run -d --restart=always -p 3001:3001 -v uptime-kuma-test:/app/data --name uptime-kuma-test hienhoceo-dpsmedia/uptime-kuma-vn:latest
   ```

3. **Test with Portainer**:
   - Use the Portainer guide in README.md
   - Repository URL: `https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn.git`
   - Repository reference: `refs/heads/master`
   - Compose path: `compose.yaml`

## 🎯 Features Included

Your Docker image includes:
- ✅ All original Uptime Kuma features
- ✅ **CSV Import** for bulk monitor creation
- ✅ **Queue Monitor Limit** for better performance control
- ✅ **Multi-architecture support** (AMD64 + ARM64)
- ✅ **Automatic builds** on every push to master

## 🔧 Troubleshooting

### Build Fails
- Check the **Actions** tab for error logs
- Verify your Docker Hub secrets are correct
- Make sure your Docker Hub repository exists

### Image Not Available
- Wait a few minutes after successful build
- Check Docker Hub to see if the image was pushed
- Verify the image name matches exactly: `hienhoceo-dpsmedia/uptime-kuma-vn`

### Portainer Can't Pull Image
- Make sure the image is public on Docker Hub
- Check the exact image name and tag
- Try pulling manually with `docker pull hienhoceo-dpsmedia/uptime-kuma-vn:latest`

## 📞 Need Help?

If you encounter any issues:
1. Check the GitHub Actions logs
2. Verify all secrets are set correctly
3. Ensure your Docker Hub repository exists
4. Check that the image is publicly accessible

---

**🎉 Once completed, your enhanced uptime-kuma-vn image will be automatically built and available for anyone to deploy!**