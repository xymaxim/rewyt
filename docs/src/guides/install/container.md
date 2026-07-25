# Container

A ready-to-run container image is available on GitHub Container Registry, with
all dependencies bundled and accessible through your browser.

The app runs as two containers managed by [Compose](https://compose-spec.io/):

- **Rewyt** ([ghcr.io/xymaxim/rewyt](https://ghcr.io/xymaxim/rewyt)) — the main app, with yt-dlp, ffmpeg, and ypb inside
- **PO token provider** ([brainicism/bgutil-ytdlp-pot-provider](https://hub.docker.com/r/brainicism/bgutil-ytdlp-pot-provider)) — handles YouTube's bot verification in the background

## Prerequisites

You'll need either Podman or Docker:

- [Podman](https://podman.io/getting-started/installation) with [Compose](https://podman-desktop.io/docs/compose)
- [Docker](https://docs.docker.com/get-docker/) with the [Compose plugin](https://docs.docker.com/compose/)

### macOS and Windows

On macOS and Windows, Podman requires a virtual machine. Initialize and start it
once:

```shell
podman machine init
podman machine start
```

The machine starts automatically on subsequent reboots. Verify it is running:

```shell
podman machine list
```

## Run the app

### Podman

Pull the compose file from the registry and extract it to a local directory:

```shell
podman artifact pull ghcr.io/xymaxim/rewyt-compose
podman artifact extract ghcr.io/xymaxim/rewyt-compose ~/rewyt
```

Start the app:

```shell
cd ~/rewyt
podman compose up -d
```

Then open it in your browser:

    http://localhost:8080

To stop the app:

```shell
podman compose down
```

### Docker

Docker Compose supports running apps directly from the registry:

```shell
docker compose -f oci://ghcr.io/xymaxim/rewyt-compose up -d
```

Then open it in your browser:

    http://localhost:8080

To stop the app:

```shell
docker compose -f oci://ghcr.io/xymaxim/rewyt-compose down
```

## Configuration

By default, Rewyt uses its own built-in yt-dlp configuration, which sets up the
PO token provider and JS runtime needed for YouTube extraction. If you have a
local yt-dlp setup, you can mount your config directory into the container by
setting `YTDLP_CONFIG_DIR`. It gets mounted at `~/.config/yt-dlp` inside the
container, one of yt-dlp's default config locations.

For example, to use cookies: export them from your browser into a
`cookies.txt` file, put it in your config directory, then reference it from
your yt-dlp config file (`config`, `config.txt `):

```
--cookies ~/.config/yt-dlp/cookies.txt
```

### Podman

```shell
YTDLP_CONFIG_DIR=~/.config/yt-dlp podman compose up -d
```

### Docker

```shell
YTDLP_CONFIG_DIR=~/.config/yt-dlp docker compose -f oci://ghcr.io/xymaxim/rewyt-compose:latest up -d
```
