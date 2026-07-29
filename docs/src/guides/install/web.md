# Web app

Running Rewyt with containers is the recommended way to get started.

> [!NOTE]
> This guide uses Podman, but Docker works too. Commands are mostly the
> same with `docker` in place of `podman`, though some steps (like
> `podman machine` and `podman artifact`) don't have a direct Docker
> equivalent.

The app runs as two containers managed by [Compose](https://compose-spec.io/):

- **Rewyt** ([ghcr.io/xymaxim/rewyt](https://ghcr.io/xymaxim/rewyt)): the main app, with yt-dlp, ffmpeg, and [ypb](https://xymaxim.github.io/ypb) inside
- **PO token provider** ([brainicism/bgutil-ytdlp-pot-provider](https://hub.docker.com/r/brainicism/bgutil-ytdlp-pot-provider)): handles YouTube's bot verification in the background

## Prerequisites

- [Podman](https://podman.io/getting-started/installation) with [Compose](https://podman-desktop.io/docs/compose)

- YouTube cookies [exported](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) from your browser

### macOS and Windows

On macOS and Windows, Podman requires a virtual machine. Initialize and start
it once:

```shell
podman machine init
podman machine start
```

The machine starts automatically on subsequent reboots.

## Set up

1. Pull the compose file and extract it to a local directory:

   ```shell
   podman artifact pull ghcr.io/xymaxim/rewyt-compose
   podman artifact extract ghcr.io/xymaxim/rewyt-compose ~/rewyt-app
   cd ~/rewyt-app
   ```

   This gives you `compose.yaml` and `.env.template` files with defaults,
   containing configuration variables, including ypb's — see
   [Configuration](#configuration) below for what's available.

2. Copy `.env.template` to `.env` and edit that copy:

   ```shell
   cp .env.template .env
   ```

   `.env` is yours to customize and won't be overwritten by future updates.

### Set up cookies (recommended)

YouTube may respond with a "Sign in to confirm you're not a bot" error
without cookies, so setting them up is recommended. To avoid this:

1. Export cookies from your browser into a `cookies.txt` file.
2. In `.env`, set `YPB_YTDLP_CONFIG_DIR` to the directory where you want
   to store yt-dlp related config files.
3. Place `cookies.txt` inside that directory.
4. Reference it from your yt-dlp config file:

        --cookies /path/to/cookies.txt

## Usage

Start the app:

```shell
podman compose up -d
```

Then open it in your browser:

    http://localhost:8080

When done, shut down the app and the PO token provider sidecar:

```shell
podman compose down
```

## Configuration

The `.env.template` file (copied to `.env` during [setup](#set-up)) holds
configuration variables, including ypb's. See [ypb's
Configuration](https://xymaxim.github.io/ypb/guides/install/container.html#configuration)
section for what's available and how to set them.

## Update the app

To update the container images:

```shell
podman compose pull
```

To pick up changes to `compose.yaml` or `.env.template`, re-run the extract
step. This leaves your `.env` untouched:

```shell
podman artifact pull ghcr.io/xymaxim/rewyt-compose
podman artifact extract ghcr.io/xymaxim/rewyt-compose .
```
