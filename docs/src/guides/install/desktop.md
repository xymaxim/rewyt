# Desktop app

## Prerequisites

Rewyt relies on yt-dlp:

* [yt-dlp](https://github.com/yt-dlp/yt-dlp/wiki/Installation): For video info
  extraction and downloading. Nightly builds are recommended. If you use
  binaries, update with: `yt-dlp --update-to nightly`.

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

| Linux                                                                                                                           | Windows                                                                                                                           | macOS                                                                                                                                 |
|---------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| [x64](https://github.com/xymaxim/rewyt/releases/download/{{ git.short_tag }}/Rewyt-{{ git.short_tag[1:] }}-linux_x64.zip) | [x64](https://github.com/xymaxim/rewyt/releases/download/{{ git.short_tag }}/Rewyt-{{ git.short_tag[1:] }}-windows_x64.zip) | [universal](https://github.com/xymaxim/rewyt/releases/download/{{ git.short_tag }}/Rewyt-{{ git.short_tag[1:] }}-macos_universal.zip) |

Download the binary for your platform and unzip it to your working directory.
