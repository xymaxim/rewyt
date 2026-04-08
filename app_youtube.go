//go:build youtube

package main

import (
	"context"
	"log"

	"github.com/xymaxim/ypb/stream"
)

func newStream(ctx context.Context, videoID string) (stream.Streamer, error) {
	log.Printf("running new stream type=youtube v=%s", videoID)
	return stream.NewStream(ctx, videoID, 8080)
}
