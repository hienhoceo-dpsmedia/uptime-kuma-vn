<div align="center" width="100%">
    <img src="./public/icon.svg" width="128" alt="" />
</div>

# Uptime Kuma

Uptime Kuma is an easy-to-use self-hosted monitoring tool.

<a target="_blank" href="https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn"><img src="https://img.shields.io/github/stars/hienhoceo-dpsmedia/uptime-kuma-vn?style=flat" /></a> <a target="_blank" href="https://hub.docker.com/r/louislam/uptime-kuma"><img src="https://img.shields.io/docker/pulls/louislam/uptime-kuma" /></a> <a target="_blank" href="https://hub.docker.com/r/louislam/uptime-kuma"><img src="https://img.shields.io/docker/v/louislam/uptime-kuma/latest?label=docker%20image%20ver." /></a> <a target="_blank" href="https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn"><img src="https://img.shields.io/github/last-commit/hienhoceo-dpsmedia/uptime-kuma-vn" /></a> <a href="https://weblate.kuma.pet/projects/uptime-kuma/uptime-kuma/">
<img src="https://weblate.kuma.pet/widgets/uptime-kuma/-/svg-badge.svg" alt="Translation status" />
</a>

<img src="https://user-images.githubusercontent.com/1336778/212262296-e6205815-ad62-488c-83ec-a5b0d0689f7c.jpg" width="700" alt="" />

## 🥔 Live Demo

Try it!

Demo Server (Location: Frankfurt - Germany): <https://demo.kuma.pet/start-demo>

It is a temporary live demo, all data will be deleted after 10 minutes.

## ⭐ Features

- Monitoring uptime for HTTP(s) / TCP / HTTP(s) Keyword / HTTP(s) Json Query / Ping / DNS Record / Push / Steam Game Server / Docker Containers
- Fancy, Reactive, Fast UI/UX
- Notifications via Telegram, Discord, Gotify, Slack, Pushover, Email (SMTP), and [90+ notification services, click here for the full list](https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn/tree/master/src/components/notifications)
- 20-second intervals
- [Multi Languages](https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn/tree/master/src/lang)
- Multiple status pages
- Map status pages to specific domains
- Ping chart
- Certificate info
- Proxy support
- 2FA support

### 🚀 Enhanced Features (uptime-kuma-vn)

- **CSV Import**: Bulk import monitors from CSV files
- **Queue Monitor Limit**: Enhanced queue management with configurable limits
- **Performance Improvements**: Optimized for better performance and reliability

## 🐳 Docker Image (uptime-kuma-vn)

### 🚀 Automatic Docker Builds

This repository includes **automatic Docker image building** using GitHub Actions! The image is automatically built and pushed to Docker Hub whenever you push changes to the master branch.

**Current image**: `hienhoceo-dpsmedia/uptime-kuma-vn:latest`

### 📋 Setup Instructions

To enable automatic builds for your fork:

1. **Create Docker Hub Repository**: See [DOCKER_SETUP.md](DOCKER_SETUP.md) for complete instructions
2. **Add GitHub Secrets**: Set up `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets
3. **Push to Master**: The build will start automatically!

### 🏷️ Available Tags

- `hienhoceo-dpsmedia/uptime-kuma-vn:latest` - Latest version from master branch
- `hienhoceo-dpsmedia/uptime-kuma-vn:2.0.2` - Version-specific releases
- Multi-architecture support: AMD64 + ARM64

### 🔧 Manual Build (Optional)

If you prefer to build manually:

```bash
# Build the Docker image
docker build -f docker/dockerfile -t hienhoceo-dpsmedia/uptime-kuma-vn:latest .

# Push to Docker Hub
docker push hienhoceo-dpsmedia/uptime-kuma-vn:latest
```

> [!NOTE]
> For detailed setup instructions, see [DOCKER_SETUP.md](DOCKER_SETUP.md)

### 🎯 What's Included

- ✅ All original Uptime Kuma features
- ✅ **CSV Import** for bulk monitor creation
- ✅ **Queue Monitor Limit** for performance control
- ✅ Multi-architecture support (Intel + ARM)
- ✅ Automatic updates when you push changes

## 🔧 How to Install

### 🐳 Docker Compose

```bash
mkdir uptime-kuma
cd uptime-kuma
curl -o compose.yaml https://raw.githubusercontent.com/hienhoceo-dpsmedia/uptime-kuma-vn/master/compose.yaml
docker compose up -d
```

Uptime Kuma is now running on <http://0.0.0.0:3001>.

> [!WARNING]
> File Systems like **NFS** (Network File System) are **NOT** supported. Please map to a local directory or volume.

### 🐳 Docker Command

> [!NOTE]
> This requires the Docker image to be available on Docker Hub. See the "Docker Image" section above for build instructions.

```bash
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data --name uptime-kuma hienhoceo-dpsmedia/uptime-kuma-vn:latest
```

Uptime Kuma is now running on <http://0.0.0.0:3001>.

> [!NOTE]
> If you want to limit exposure to localhost (without exposing port for other users or to use a [reverse proxy](https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn/wiki/Reverse-Proxy)), you can expose the port like this:
>
> ```bash
> docker run -d --restart=always -p 127.0.0.1:3001:3001 -v uptime-kuma:/app/data --name uptime-kuma hienhoceo-dpsmedia/uptime-kuma-vn:latest
> ```

### 🌐 Portainer

You can easily deploy Uptime Kuma using Portainer's stack management with Git repository integration. This method provides a user-friendly web interface and automatically pulls the latest configuration from your repository.

#### Git Repository Deployment (Recommended)

1. **Access Portainer**: Log in to your Portainer instance
2. **Navigate to Stacks**: Go to `Stacks` in the left menu
3. **Add Stack**: Click `Add stack` button
4. **Create Stack Configuration**:
   - **Name**: Enter a name for your stack (e.g., `uptime-kuma`)
   - **Build method**: Select `Git repository`

5. **Repository Settings**:
   - **Repository URL**: `https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn.git`
   - **Repository reference**: `refs/heads/master`
   - **Compose path**: `compose.yaml`
   - **Authentication**: Leave blank for public repository

6. **Environment Variables (Optional)**:
   You can add environment variables if needed, but the default configuration should work out of the box.

7. **Access Control (Optional)**:
   - If you want to restrict access, enable `Enable access control`
   - Choose your preferred access control settings

8. **Deploy**: Click `Deploy the stack`

> [!IMPORTANT]
> If you encounter a "reference not found" error, try these solutions:
> - Use `master` instead of `main` as the branch reference
> - Try leaving the repository reference field empty (uses default branch)
> - Use the Web Editor method below as an alternative

#### Web Editor Method (Alternative)

If the Git repository method doesn't work, you can use the Web Editor method:

1. **Access Portainer**: Log in to your Portainer instance
2. **Navigate to Stacks**: Go to `Stacks` in the left menu
3. **Add Stack**: Click `Add stack` button
4. **Create Stack Configuration**:
   - **Name**: Enter a name for your stack (e.g., `uptime-kuma`)
   - **Build method**: Select `Web editor`
5. **Compose Configuration**: Copy and paste the following docker-compose configuration:

```yaml
version: '3.8'

services:
  uptime-kuma:
    image: hienhoceo-dpsmedia/uptime-kuma-vn:latest
    container_name: uptime-kuma
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - uptime-kuma-data:/app/data
    networks:
      - uptime-kuma-network

volumes:
  uptime-kuma-data:

networks:
  uptime-kuma-network:
    driver: bridge
```

6. **Deploy**: Click `Deploy the stack`

#### What Happens Behind the Scenes

Portainer will automatically:
- Clone your repository `https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn.git`
- Use the `compose.yaml` file from your repository
- Pull the Docker image `hienhoceo-dpsmedia/uptime-kuma-vn:latest`
- Create necessary volumes and networks
- Deploy the container with proper configuration

#### Benefits of Git Repository Method

- **Always Updated**: When you update your `compose.yaml` in the repository, you can easily redeploy
- **Version Control**: Track changes to your deployment configuration
- **Team Collaboration**: Multiple team members can use the same configuration
- **Backup**: Your deployment configuration is safely stored in Git
- **Easy Updates**: Simply pull the latest changes from your repository

#### Portainer Management Features

Once deployed, you can easily manage Uptime Kuma through Portainer:

- **Container Control**: Start, stop, restart, and remove containers
- **Logs Monitoring**: View real-time container logs
- **Resource Statistics**: Monitor CPU, memory, and network usage
- **Volume Management**: Backup and restore your monitoring data
- **Network Configuration**: Manage container networking
- **Environment Variables**: Modify configuration without recreating containers
- **Updates**: Easily update to new versions when you release them

#### Updating Your Deployment

When you release a new version or update your `compose.yaml`:

1. Go to your stack in Portainer
2. Click `Editor` to view current configuration
3. Click `Pull latest changes` to fetch from your repository
4. Click `Update the stack` to redeploy with new configuration

#### Accessing Uptime Kuma

After deployment, Uptime Kuma will be available at:
- `http://<your-server-ip>:3001`

> [!TIP]
> This Git repository method is perfect for production environments as it ensures consistent deployments and makes it easy to manage multiple instances from the same source configuration.

> [!NOTE]
> If you need to customize the deployment, you can fork the repository and modify the `compose.yaml` file to match your specific requirements.

### 💪🏻 Non-Docker

Requirements:

- Platform
  - ✅ Major Linux distros such as Debian, Ubuntu, CentOS, Fedora and ArchLinux etc.
  - ✅ Windows 10 (x64), Windows Server 2012 R2 (x64) or higher
  - ❌ FreeBSD / OpenBSD / NetBSD
  - ❌ Replit / Heroku
- [Node.js](https://nodejs.org/en/download/) >= 20.4
- [Git](https://git-scm.com/downloads)
- [pm2](https://pm2.keymetrics.io/) - For running Uptime Kuma in the background

```bash
git clone https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn.git
cd uptime-kuma
npm run setup

# Option 1. Try it
node server/server.js

# (Recommended) Option 2. Run in the background using PM2
# Install PM2 if you don't have it:
npm install pm2 -g && pm2 install pm2-logrotate

# Start Server
pm2 start server/server.js --name uptime-kuma
```

Uptime Kuma is now running on <http://localhost:3001>

More useful PM2 Commands

```bash
# If you want to see the current console output
pm2 monit

# If you want to add it to startup
pm2 startup && pm2 save
```

### Advanced Installation

If you need more options or need to browse via a reverse proxy, please read:

<https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn/wiki/%F0%9F%94%A7-How-to-Install>

## 🆙 How to Update

Please read:

<https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn/wiki/%F0%9F%86%99-How-to-Update>

## 🆕 What's Next?

Check out our project milestones for upcoming features and releases:

<https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn/milestones>

## ❤️ Sponsors

Thank you so much! (GitHub Sponsors will be updated manually. OpenCollective sponsors will be updated automatically, the list will be cached by GitHub though. It may need some time to be updated)

<img src="https://uptime.kuma.pet/sponsors?v=6" alt />

## 🖼 More Screenshots

Light Mode:

<img src="https://uptime.kuma.pet/img/light.jpg" width="512" alt="" />

Status Page:

<img src="https://user-images.githubusercontent.com/1336778/134628766-a3fe0981-0926-4285-ab46-891a21c3e4cb.png" width="512" alt="" />

Settings Page:

<img src="https://louislam.net/uptimekuma/2.jpg" width="400" alt="" />

Telegram Notification Sample:

<img src="https://louislam.net/uptimekuma/3.jpg" width="400" alt="" />

## Motivation

- I was looking for a self-hosted monitoring tool like "Uptime Robot", but it is hard to find a suitable one. One of the closest ones is statping. Unfortunately, it is not stable and no longer maintained.
- Wanted to build a fancy UI.
- Learn Vue 3 and vite.js.
- Show the power of Bootstrap 5.
- Try to use WebSocket with SPA instead of a REST API.
- Deploy my first Docker image to Docker Hub.

If you love this project, please consider giving it a ⭐.

## 🗣️ Discussion / Ask for Help

⚠️ For any general or technical questions, please don't send me an email, as I am unable to provide support in that manner. I will not respond if you ask questions there.

I recommend using Google, GitHub Issues, or Uptime Kuma's subreddit for finding answers to your question. If you cannot find the information you need, feel free to ask:

- [GitHub Issues](https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn/issues)
- [Subreddit (r/UptimeKuma)](https://www.reddit.com/r/UptimeKuma/)

## Contributions

### Create Pull Requests

We DO NOT accept all types of pull requests and do not want to waste your time. Please be sure that you have read and follow pull request rules:
[CONTRIBUTING.md#can-i-create-a-pull-request-for-uptime-kuma](https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn/blob/master/CONTRIBUTING.md#can-i-create-a-pull-request-for-uptime-kuma)

### Test Pull Requests

There are a lot of pull requests right now, but I don't have time to test them all.

If you want to help, you can check this:
<https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn/wiki/Test-Pull-Requests>

### Test Beta Version

Check out the latest beta release here: <https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn/releases>

### Bug Reports / Feature Requests

If you want to report a bug or request a new feature, feel free to open a [new issue](https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn/issues).

### Translations

If you want to translate Uptime Kuma into your language, please visit [Weblate Readme](https://github.com/hienhoceo-dpsmedia/uptime-kuma-vn/blob/master/src/lang/README.md).

### Spelling & Grammar

Feel free to correct the grammar in the documentation or code.
My mother language is not English and my grammar is not that great.
