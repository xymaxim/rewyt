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

# Get yt-dlp and ypb binaries
FROM alpine:latest AS binaries
RUN apk add --no-cache curl unzip jq
RUN curl -L https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp_linux -o /yt-dlp \
    && chmod +x /yt-dlp
RUN URL="$(curl -fsSL https://api.github.com/repos/xymaxim/ypb/releases/latest \
    | jq -r '.assets[] | select(.name | test("linux-amd64\\.zip$")) | .browser_download_url')" \
    && curl -fsSL -o /tmp/ypb.zip "$URL" \
    && unzip /tmp/ypb.zip -d / \
    && chmod +x /ypb

# Runtime stage
FROM gcr.io/distroless/base-debian13

LABEL org.opencontainers.image.title="Rewyt"
LABEL org.opencontainers.image.description="A desktop app for rewatching YouTube live streams."
LABEL org.opencontainers.image.source="https://github.com/xymaxim/rewyt"
LABEL org.opencontainers.image.licenses="AGPL-3.0-or-later"

COPY --from=ffmpeg /ffmpeg /usr/local/bin/ffmpeg
COPY --from=ffmpeg /ffprobe /usr/local/bin/ffprobe

COPY --from=binaries /yt-dlp /usr/local/bin/yt-dlp
COPY --from=binaries /ypb /usr/local/bin/ypb

COPY --from=builder /app/rewyt /rewyt
COPY --from=builder /app/frontend/dist /frontend/dist

EXPOSE 3000
ENV WAILS_SERVER_HOST=0.0.0.0
ENTRYPOINT ["/rewyt"]
