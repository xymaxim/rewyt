# Desktop app

## Prerequisites

Rewyt relies on yt-dlp:

* [yt-dlp](https://github.com/yt-dlp/yt-dlp/wiki/Installation): For video
  information fetching. *Nightly builds are recommended.*

* [FFprobe](https://ffmpeg.org/): For inspecting media segments.

### Additional dependencies

The following dependencies are optional, but strongly recommended in practice:

* [External JavaScript runtime](https://github.com/yt-dlp/yt-dlp/issues/15012):
  Required for full YouTube support

* Proof-of-Origin (PO) token [provider
  plugin](https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide): Required to
  avoid HTTP 403 errors

## Install from binaries

Pre-built binaries for different platforms are available on the GitHub [latest
release](https://github.com/xymaxim/rewyt/releases/latest) page.

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

Download the binary for your platform and unzip it to your working directory.

## Setup

While optional, the setup steps below are strongly recommended.

### Update yt-dlp to nightly

YouTube changes frequently, and the stable yt-dlp release can be outdated.
Switch to the nightly build, which is updated daily:

```shell
yt-dlp --update-to nightly
```

Check the result with `yt-dlp --version`.

### Sign in with cookies

Some streams respond with a "Sign in to confirm you're not a bot" error unless
you provide cookies. Export your YouTube cookies from a logged-in browser (see
[yt-dlp's instructions](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)),
then add a line to your [yt-dlp configuration
file](https://github.com/yt-dlp/yt-dlp#configuration):

```text
--cookies cookies.txt
```

### Install a JavaScript runtime

If yt-dlp cannot find a JavaScript runtime, you will see this warning:

```text
WARNING: [youtube] No supported JavaScript runtime could be found. Only deno is
enabled by default; to use another runtime add --js-runtimes RUNTIME[:PATH] to
your command/config. YouTube extraction without a JS runtime has been
deprecated, and some formats may be missing. See
https://github.com/yt-dlp/yt-dlp/wiki/EJS for details on installing one
```

Install [Deno](https://deno.com/) (version 2.0 or later). If it is not detected
automatically, point `yt-dlp` at it:

```text
--js-runtimes deno:/path/to/deno
```

See the [EJS wiki](https://github.com/yt-dlp/yt-dlp/wiki/EJS) for other
supported runtimes.

### Avoid HTTP 403 errors with a PO token provider

During playback you may get transient HTTP 403 errors, caused by YouTube's bot
verification. yt-dlp works around them with a Proof-of-Origin (PO) token
provider plugin:

1. Install the
   [bgutil-ytdlp-pot-provider](https://github.com/Brainicism/bgutil-ytdlp-pot-provider)
   plugin.
2. Run the provider's HTTP server, which listens on `http://127.0.0.1:4416` by
   default.

With the default address, no further configuration is needed. If you run the
server elsewhere, point yt-dlp at it:

```text
--extractor-args "youtubepot-bgutilhttp:base_url=http://127.0.0.1:8080"
```

See yt-dlp's [PO Token Guide](https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide)
for details.

