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

[Podman](https://podman.io/getting-started/installation) with [Compose](https://podman-desktop.io/docs/compose).

### macOS and Windows

On macOS and Windows, Podman requires a virtual machine. Initialize and start
it once:

```shell
podman machine init
podman machine start
```

The machine starts automatically on subsequent reboots.

## Set up

Pull the compose file and extract it to a local directory:

```shell
podman artifact pull ghcr.io/xymaxim/rewyt-compose
podman artifact extract ghcr.io/xymaxim/rewyt-compose ~/rewyt-app
cd ~/rewyt-app
```

This gives you `compose.yaml` and a `.env` file with defaults, containing ypb's
configuration variables.

If YouTube responds with a "Sign in to confirm you're not a bot" error, setting
up cookies usually resolves it. See [Configuration](#configuration) below.

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

The `.env` file holds ypb's configuration variables. See
[ypb's Configuration section](https://xymaxim.github.io/ypb/guides/install/container.html#configuration)
for what's available and how to set them.

For example, to use cookies, export them from your browser into a
`cookies.txt` file, place it inside your `YPB_YTDLP_CONFIG_DIR`, then
reference it from your yt-dlp config file:

    --cookies /path/to/cookies.txt

## Update the app

```shell
podman compose pull
```
