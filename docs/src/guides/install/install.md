# Installation

Available on Linux, macOS, and Windows.

Rewyt comes in two distributions, each with its own installation process:

1. [**Desktop app**](binaries.md): Install platform-specific pre-built binaries
   along with additional dependencies
2. [**Web app**](web.md): Run in a container with all dependencies
   bundled, and access via your browser

## Choosing installation method

The choice depends on your current setup and usage:

| Feature      | Pre-built binaries                                             | Container image                                       |
|--------------|----------------------------------------------------------------|-------------------------------------------------------|
| Setup        | You already have yt-dlp installed with additional dependencies | You want a self-contained setup with all dependencies |
| Installation | Manual installation of binaries and dependencies               | Requires Podman or Docker                             |
| Updates      | Manual updating of all dependencies                            | Updating container image                              |
