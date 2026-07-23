# Build stage
FROM golang:alpine AS builder
WORKDIR /app
RUN apk add --no-cache git nodejs npm
COPY . .
RUN cd frontend && npm ci && npm run build
RUN go mod tidy
RUN go build -tags server -ldflags="-s -w" -o rewyt .

# Get static FFmpeg binaries
FROM mwader/static-ffmpeg:8.1.2 AS ffmpeg

# Get deno
FROM docker.io/denoland/deno:bin-2.6.3 AS deno

# Get yt-dlp
FROM alpine:latest AS ytdlp
RUN apk add --no-cache curl unzip jq

RUN curl -L https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp_linux -o /yt-dlp \
    && chmod +x /yt-dlp

RUN mkdir -p /yt-dlp-plugins \
    && curl -fL -o /tmp/pot-plugin.zip \
      "https://github.com/Brainicism/bgutil-ytdlp-pot-provider/releases/latest/download/bgutil-ytdlp-pot-provider.zip" \
    && unzip -q /tmp/pot-plugin.zip -d /yt-dlp-plugins/

# Get ypb
FROM ghcr.io/xymaxim/ypb:bin-latest AS ypb

# Runtime stage
FROM gcr.io/distroless/cc-debian13

LABEL org.opencontainers.image.title="Rewyt"
LABEL org.opencontainers.image.description="A desktop app for rewatching YouTube live streams."
LABEL org.opencontainers.image.source="https://github.com/xymaxim/rewyt"
LABEL org.opencontainers.image.licenses="AGPL-3.0-or-later"

COPY --from=ffmpeg /ffmpeg /usr/local/bin/ffmpeg
COPY --from=ffmpeg /ffprobe /usr/local/bin/ffprobe

COPY --from=deno /deno /usr/local/bin/deno

COPY --from=ytdlp /yt-dlp /usr/local/bin/yt-dlp
COPY --from=ytdlp /yt-dlp-plugins /etc/yt-dlp/plugins/bgutil-ytdlp-pot-provider

COPY --from=ypb /ypb /usr/local/bin/ypb

COPY --from=builder /app/rewyt /rewyt
COPY --from=builder /app/frontend/dist /frontend/dist

COPY yt-dlp.container.conf /etc/yt-dlp/config

ENV HOME=/root

EXPOSE 3000
ENV WAILS_SERVER_HOST=0.0.0.0
ENTRYPOINT ["/rewyt"]
