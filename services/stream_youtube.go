//go:build !local

package services

import (
	"context"
	"log"

	"github.com/xymaxim/ypb/stream"
)

func newStream(ctx context.Context, videoID string, port int, onPrint func([]byte)) (stream.Streamer, error) {
	log.Printf("running new stream on port %d type=youtube v=%s", port, videoID)
	cfg := &stream.StreamConfig{
		OnPrint: onPrint,
	}
	return stream.NewStream(ctx, videoID, port, cfg)
}
