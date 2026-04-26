# Web app

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

## Usage

### Basic commands

Run `rewyt` commands directly with the container:

```shell
podman run --rm ghcr.io/xymaxim/rewyt version
```

### Recommended aliases

For easier usage, add these aliases to your shell configuration file:

```shell
# General command
alias rewyt='podman run --rm ghcr.io/xymaxim/rewyt'
```

> [!IMPORTANT]
> On SELinux-enabled systems add `:Z` to the volume mount to avoid permission
> errors.

## Update the image

To update `rewyt` and all dependecies to the latest version:

```shell
podman pull ghcr.io/xymaxim/rewyt
```
