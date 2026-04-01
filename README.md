# ypb-play

_Rewind and play YouTube live streams_

This is a desktop application that lets you interactively rewind and play
YouTube live streams beyond the web player's standard 12-hour limit. You can
quicky browse stream history and pick specific moments to replay or download
them later.

Built with [Go](https://go.dev/), [Svelte
5](https://github.com/sveltejs/svelte/), [Shaka
Player](https://github.com/shaka-project/shaka-player/), and packaged with
[Wails](https://github.com/wailsapp/wails/).

## Overview

The application is built on a Go backend with an user interface written in
Svelte. It uses our [ypb](https://github.com/xymaxim/ypb) to locate stream
moments and generate corresponding dynamic MPEG-DASH manifests, with a proxy
serving media segments to the user while handling retryable HTTP errors. Video
playback is handled by Shaka Player with adaptive streaming.

## Installation

ypb-play can be run in two ways: (1) as a **desktop application** via binaries
pre-built with Wails or (2) as a **web application** via container image and
accessed with a local browser

### Pre-built binaries

This method requires [yt-dlp](https://github.com/yt-dlp/yt-dlp/) (nightly build)
to be installed in your system. Downloading intervals will also require
[FFmpeg](http://ffmpeg.org/) and
[ypb](https://xymaxim.github.io/ypb/guides/install/install.html) to be installed
separetely.

Then, download the latest binary for your platform: [GitHub
Releases](https://github.com/xymaxim/ypb/releases/latest)

### Container image

The container image contains all needed dependencies required for rewinding,
playing, and downloading live streams.

You’ll need either [Podman](https://podman.io/getting-started/installation) or
[Docker](https://docs.docker.com/get-docker/).

1. Pull the latest image: `podman pull ghcr.io/xymaxim/ypb-play`
2. Run the web application: `podman run --rm -p 3000:8080 ghcr.io/xymaxim/ypb-play`
3. Open this address in a browser: http://localhost:3000/

> [!NOTE]
> On macOS and Windows, Podman requires a virtual machine. Initialize and start it once:
>
>     podman machine init
>     podman machine start

## Credits

The font used in the application is [Inter](https://github.com/rsms/inter/). The
icons are from [Phosphorous Icons](https://phosphoricons.com/).

## License

MIT.
