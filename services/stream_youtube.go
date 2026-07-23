//go:build !local

package services

import (
	"context"
	"log"

	"github.com/xymaxim/ypb"
)

func newStream(ctx context.Context, videoID string, port int, onPrint func([]byte)) (ypb.Streamer, error) {
	log.Printf("running new stream on port %d type=youtube v=%s", port, videoID)
	cfg := &ypb.StreamConfig{
		OnPrint: onPrint,
	}
	return ypb.NewStream(ctx, videoID, port, cfg)
}
