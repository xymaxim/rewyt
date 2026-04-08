//go:build !youtube

package main

import (
	"context"
	"log"

	"github.com/xymaxim/ypb/stream"

	"ypb-play/local"
)

func newStream(ctx context.Context, videoID string, port int) (stream.Streamer, error) {
	log.Printf("running new stream on port %d type=local v=%s", port, videoID)
	cfg := local.Config{
		VideoID:     videoID,
		Port:        port,
		SegmentsDir: "./local/dash/segments/",
		MPDDelay:    0,
		StreamStart: 200,
	}
	return local.NewStream(ctx, cfg), nil
}
