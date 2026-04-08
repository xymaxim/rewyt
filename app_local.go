//go:build !youtube

package main

import (
	"context"
	"log"

	"github.com/xymaxim/ypb/stream"

	"ypb-play/local"
)

func newStream(ctx context.Context, videoID string) (stream.Streamer, error) {
	log.Printf("running new stream type=local v=%s", videoID)
	cfg := local.Config{
		VideoID:     videoID,
		Port:        8080,
		SegmentsDir: "./local/dash/segments/",
		MPDDelay:    0,
		StreamStart: 200,
	}
	return local.NewStream(ctx, cfg), nil
}
