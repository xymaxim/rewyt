//go:build youtube

package main

import (
	"context"
	"log"

	"github.com/xymaxim/ypb/stream"
)

func newStream(ctx context.Context, videoID string, port int) (stream.Streamer, error) {
	log.Printf("running new stream on port %d type=youtube v=%s", port, videoID)
	return stream.NewStream(ctx, videoID, port)
}
