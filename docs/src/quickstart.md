# Quickstart

Learn how to install Rewyt and start rewatching YouTube live streams.

## Installation

Rewyt comes as a **desktop app** (pre-built binary) or a **web app**
(container).

- [Desktop app](guides/install/desktop.md): choose this if you already have `yt-dlp` installed
- [Web app](guides/install/web.md): choose this if you don't, or prefer a self-contained setup

### Desktop app

Download the binary for your platform from the [latest
release](https://github.com/xymaxim/rewyt/releases/latest) and unzip it to your
working directory.

*Latest release {{ git.short_tag }}*

<div class="grid cards three-cols" markdown>

-   :material-linux:{ .lg } **Linux**

    [x64][Rewyt-linux-x64]

-   :material-apple:{ .lg } **macOS**

    [universal][Rewyt-macos-universal]
    
-   :material-microsoft-windows:{ .lg } **Windows**

    [x64][Rewyt-windows-x64]

</div>

[Rewyt-linux-x64]: https://github.com/xymaxim/rewyt/releases/download/{{ git.short_tag }}/Rewyt-{{ git.short_tag[1:] }}-linux_x64.zip
[Rewyt-macOS-universal]: https://github.com/xymaxim/rewyt/releases/download/{{ git.short_tag }}/Rewyt-{{ git.short_tag[1:] }}-macos_universal.zip
[Rewyt-windows-x64]: https://github.com/xymaxim/rewyt/releases/download/{{ git.short_tag }}/Rewyt-{{ git.short_tag[1:] }}-windows_x64.zip

<div class="grid" markdown>

:lucide-forward: See [Desktop app](guides/install/desktop.md) for
prerequisites and platform details.
{ .card }

</div>

### Web app

Running Rewyt in containers gives you an isolated environment with `yt-dlp`,
`ffprobe`, and `ypb` pre-installed, along with the PO token provider.

**Prerequisites:** [Podman](https://podman.io/getting-started/installation) or
[Docker](https://docs.docker.com/get-docker/), with Compose.

**macOS/Windows only, Podman:** Initialize the Podman machine (one-time setup):

    podman machine init && podman machine start

Pull the compose file and extract it to a local directory:

    podman artifact pull ghcr.io/xymaxim/rewyt-compose
    podman artifact extract ghcr.io/xymaxim/rewyt-compose ~/rewyt-app
    cd ~/rewyt-app

Start the app:

    podman compose up -d

Open the app in your browser:

    http://localhost:8080

<div class="grid" markdown>

:lucide-forward: See [Web app](guides/install/web.md) for configuration options
and more details.
{ .card }

</div>

## Initial setup

YouTube might responds with a "Sign in to confirm you're not a bot" error while
loading a stream, so you'll need to provide cookies from a signed-in browser
session. How to set them depends on how you installed Rewyt:

- **Desktop app**: uses your yt-dlp configuration file, see [Sign in with
  cookies](http://localhost:8000/rewyt/docs/guides/install/desktop/#sign-in-with-cookies)
  for details
- **Web app**: uses a configuration file mounted into the container, see
  [Set up cookies](guides/install/web.md#set-up-cookies-recommended) for details

## Verify installation

Open the app to see a welcome screen, where you can verify that your
installation is complete. If something's missing, you'll see a warning
describing what's needed. Otherwise, you're ready to go.

## Rewatch a specific moment

### Open a live stream

To get started, you'll need a live stream to rewind. If you're not sure what to
watch, the [Cornell Lab Bird Cams](https://www.allaboutbirds.org/cams/) project
has beautiful bird cam streams from around the world. Let's use the [Northern
Royal Albatross nesting
cam](https://www.allaboutbirds.org/cams/royal-albatross/) at Taiaroa Head, New
Zealand.

Copy the [YouTube link](https://www.youtube.com/watch?v=Mm_zVDDUeNA) of the live stream and paste it into the input field in
the app. Wait for the stream to load. You'll see the main interface, with the
main controls, timeline, and sliders.

<figure>
<img src="./quickstart-files/quickstart-main.png"/>
<figcaption aria-hidden="true">
Main interface showing the main controls with
timeline zoom levels, timeline, rewind slider with the rewind button, days
slider, and day slider. (A sample stream is used for demonstration.)
</figcaption>
</figure>

### Set a timezone

By default, the app displays time in your local system timezone. Since you're
watching a stream from New Zealand, it's more convenient to match the stream's
local time instead.

Click the timezone label in the time display, below the video, to open the
timezone selector. Select New Zealand Standard Time (UTC+12) or New Zealand
Daylight Time (UTC+13).

### Click the timeline

Click anywhere on the timeline. The stream immediately rewinds to that moment
and starts playing.

<figure>
<img src="./quickstart-files/quickstart-rewind-click.png"/>
<figcaption aria-hidden="true">Selecting a time by clicking on the timeline</figcaption>
</figure>

Try zooming in on the timeline for a narrower time range, then click again to
land closer to the moment you want.

### Control with sliders

For more precision, use the rewind slider, days slider, and day slider
instead. Drag the days slider to pick a day, then drag the day slider to set a
specific time within that day. Sliders set your target time without
rewinding yet.

<figure>
<img src="./quickstart-files/quickstart-rewind-sliders.png"/>
<figcaption aria-hidden="true">Selecting a time using sliders without rewinding</figcaption>
</figure>

When you're happy with your selection, click the rewind button to jump there.

You can combine both methods: use the sliders to get close to a moment before
rewinding, then click the timeline to rewind to the exact moment.

## Next steps

Learn how to:

- [Highlight and download excerpts](guides/download-excerpts.md): save a specific part of a stream
- [Share and paste timestamps](guides/share-timestamps.md): share the moment you discovered and jump to a shared timestamp
