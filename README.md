<img src="images/icon.svg" alt="Rewyt icon" width="100px" align="center" />

# Rewyt

_Rewind and play YouTube live streams_

Rewyt is a desktop app for rewatching past moments of live streams beyond
YouTube's limits.

Built with [Go](https://go.dev/), [Svelte](https://github.com/sveltejs/svelte/),
[Shaka Player](https://github.com/shaka-project/shaka-player/), and packaged
with [Wails](https://github.com/wailsapp/wails/). Available on Linux, macOS, and
Windows.

![Main screenshot](images/screenshot.png)

## Overview

The app is built on a Go backend with a Svelte frontend. It uses our
[ypb](https://github.com/xymaxim/ypb) to locate moments in a live stream,
generate dynamic MPEG-DASH manifests, and act as a stream proxy that delivers
media segments while gracefully handling connection errors. [Shaka
Player](https://github.com/shaka-project/shaka-player) plays the video with
adaptive streaming from YouTube through the stream proxy. See more details
[here](https://xymaxim.github.io/rewyt/docs/overview.html).

## Installation

Rewyt comes as a (1) **desktop app** via pre-built binaries or (2) **web
app** via container, accessible through your browser. See the [Installation
guide](https://xymaxim.github.io/rewyt/docs/guides/install/install.html) for setup
instructions.

## Etymology

1. *(v.)* to rewind and rewatch YouTube live streams
2. *(n.)* from Anglo-Saxon "rewyt",
   [meaning](https://archive.org/details/analectaanglosax00tho/page/240/mode/2up?q=rewyt)
   *navigation*, *voyage*, reflecting the act of exploring and revisiting
   moments.

## Credits

The font used in the application is [Geist](https://vercel.com/font). The
icons are from [Lucide Icons](https://lucide.dev/).

## Disclaimer

This app unfortunately violates YouTube's [Terms of
Service](https://www.youtube.com/t/terms), so use it at your own risk. You
might run into rate limits or get blocked if YouTube notices.

If you enjoy the videos you watch, please consider supporting the creators by
subscribing to their channels and engaging with their content directly.

## License

GNU Affero General Public License v3.0.
