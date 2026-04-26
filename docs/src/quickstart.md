# Get started with Rewyt

This tutorial quickly shows how to install and start using Rewyt.

## Installation

Rewyt is available as a (1) **desktop app** via pre-built binaries or (2) **web
app** via container, accessible through your browser. The choice mainly depends
on your preferences and what's already installed on your system.

### Install from binaries

Rewyt requires `yt-dlp` and the [related
dependencies](guides/install/install.md#requirements). If you already have a
working `yt-dlp` installation on your computer (ensure it is in your `PATH`),
the quickest way to start is to download the pre-built binaries.

Use the links from the [latest
release](https://github.com/xymaxim/rewyt/releases/latest) below for your platform
and architecture:

|       | Linux                   | macOS                    | Windows                   |
|-------|-------------------------|--------------------------|---------------------------|
| AMD64 | [Rewyt_linux_amd64.zip] | [Rewyt_darwin_amd64.zip] | [Rewyt_windows_amd64.zip] |
| ARM64 | [Rewyt_linux_arm64.zip] | [Rewyt_darwin_arm64.zip] | [Rewyt_windows_arm64.zip] |

[Rewyt_linux_amd64.zip]: https://github.com/xymaxim/rewyt/releases/download/{{ release_version }}/Rewyt_{{ release_version }}_linux-amd64.zip
[Rewyt_linux_arm64.zip]: https://github.com/xymaxim/rewyt/releases/download/{{ release_version }}/Rewyt_{{ release_version }}_linux-arm64.zip
[Rewyt_darwin_amd64.zip]: https://github.com/xymaxim/rewyt/releases/download/{{ release_version }}/Rewyt_{{ release_version }}_darwin_amd64.zip
[Rewyt_darwin_arm64.zip]: https://github.com/xymaxim/rewyt/releases/download/{{ release_version }}/Rewyt_{{ release_version }}_darwin_arm64.zip
[Rewyt_windows_amd64.zip]: https://github.com/xymaxim/rewyt/releases/download/{{ release_version }}/Rewyt_{{ release_version }}_windows_amd64.zip
[Rewyt_windows_arm64.zip]: https://github.com/xymaxim/rewyt/releases/download/{{ release_version }}/Rewyt_{{ release_version }}_windows_arm64.zip

Download and unzip a file to your working directory.

> See [Dekstop app](guides/install/desktop.md) for more details.

### Try in a container

Running in a container allows you to try Rewyt in an isolated environment with all required dependencies pre-installed.

**Prerequisites:** [Podman](https://podman.io/getting-started/installation) or [Docker](https://docs.docker.com/get-docker/)

**macOS/Windows only:** Initialize the Podman machine (one-time setup):

    podman machine init && podman machine start

Pull the container image and verify the version:

    podman pull ghcr.io/xymaxim/rewyt
    podman run --rm ghcr.io/xymaxim/rewyt

> See [Web app](guides/install/web.md) for more details.


