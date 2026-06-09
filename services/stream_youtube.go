//go:build youtube

package main

import (
	"context"
	"log"

	"github.com/xymaxim/ypb/stream"
	"rewyt/youtube"
)

func newStream(ctx context.Context, videoID string, port int, onPrint func([]byte)) (stream.Streamer, error) {
	log.Printf("running new stream on port %d type=youtube v=%s", port, videoID)
	cfg := youtube.Config{
		VideoID:     videoID,
		Port:        port,
		OnPrint:     onPrint,
	}
	return youtube.NewStream(ctx, cfg)
}
