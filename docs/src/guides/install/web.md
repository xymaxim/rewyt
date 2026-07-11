# Web app

A ready-to-run container image is available on GitHub Container Registry, with all dependencies bundled and accessible through your browser for easy installation and use.

## Prerequisites

No additional dependencies required: the container image includes all necessary
components (ypb, yt-dlp, additional dependencies).

You'll need either [Podman](https://podman.io/getting-started/installation)
(recommended) or [Docker](https://docs.docker.com/get-docker/).

### Initial setup

On macOS and Windows, Podman requires a virtual machine. Initialize and start it
once:

```shell
podman machine init
podman machine start
```

The machine will automatically start on reboots. You can verify it is running:

```shell
podman machine list
```

## Pull the image

Pull the latest container image from GitHub Container Registry:

```shell
podman pull ghcr.io/xymaxim/rewyt
```

## Run the app

Start the app in server mode and expose it on port 3000:

```shell
podman run --name rewyt -p 3000:3000 ghcr.io/xymaxim/rewyt:latest
```

Then open it in your browser:
    
    http://localhost:3000

To run it in the background, add `-d`:

```shell
podman run -d --name rewyt -p 3000:3000 ghcr.io/xymaxim/rewyt:latest
```

## Useful alias

For easier usage, add this alias to your shell configuration file:

```shell
alias rewyt='podman run --name rewyt -p 3000:3000 ghcr.io/xymaxim/rewyt:latest'
```

## Update the image

To update `rewyt` to the latest version:

```shell
podman pull ghcr.io/xymaxim/rewyt
```
