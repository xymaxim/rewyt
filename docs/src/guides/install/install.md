# Installation

Available on Linux, macOS, and Windows.

Rewyt comes in two distributions, each with its own installation process:

1. [**Desktop app**](binaries.md): Install platform-specific pre-built binaries
   along with additional dependencies
2. [**Web app**](container.md): Run in a container with all dependencies
   bundled, and access via your browser

## Choosing installation method

The choice depends on your current setup and usage:

| Feature      | Pre-built binaries                                             | Container image                                       |
|--------------|----------------------------------------------------------------|-------------------------------------------------------|
| Setup        | You already have yt-dlp installed with additional dependencies | You want a self-contained setup with all dependencies |
| Installation | Manual installation of binaries and dependencies               | Requires Podman or Docker                             |
| Updates      | Manual updating of all dependencies                            | Updating container image                              |

## Requirements

Rewyt relies on yt-dlp:

* [yt-dlp](https://github.com/yt-dlp/yt-dlp/wiki/Installation): For video info
  extraction and downloading. Nightly builds are recommended. If you use
  binaries, update with: `yt-dlp --update-to nightly`

### Additional dependencies

The following dependencies are optional but strongly recommended:

* [External JavaScript runtime](https://github.com/yt-dlp/yt-dlp/issues/15012):
  Required for full YouTube support

* Proof-of-Origin (PO) token [provider
  plugin](https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide): Required to
  avoid HTTP 403 errors
