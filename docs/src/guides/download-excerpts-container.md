# Download excerpts with container images

This guide shows you how to download a highlighted live stream excerpt when Rewyt and [ypb](https://xymaxim.github.io/ypb/) are run from container images.

## Prerequisites

- [Podman](https://podman.io/getting-started/installation) or [Docker](https://docs.docker.com/get-docker/)
- Rewyt running from a [container image](https://xymaxim.github.io/rewyt/docs/guides/install/web.html)
- ypb available as a [container image](https://xymaxim.github.io/ypb/guides/install/container.html)

## Highlight the excerpt

> [!NOTE]
> For highlighting excerpts in Rewyt, see [Highlight and download excerpts](./download-excerpts.md).

Highlight the excerpt and copy its timestamp, for example:

```text
2026-06-20T10:00:00+03:00/2026-06-20T20:00:00+03:00
```

## Download the excerpt

Run `ypb` from its container image, mounting the current directory so the downloaded file is saved locally:

```shell
podman run --rm -v .:/content ghcr.io/xymaxim/ypb download \
  2026-06-20T10:00:00+03:00/2026-06-20T20:00:00+03:00 abcdefgh123
```

The file is saved in your current working directory.
