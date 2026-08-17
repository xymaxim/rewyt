package services

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/xymaxim/ypb"
)

func newStream(ctx context.Context, videoID string, port int, onPrint func([]byte)) (ypb.Streamer, error) {
	if fixtureDir := os.Getenv("REWYT_MOCK_FIXTURE_DIR"); fixtureDir != "" {
		log.Printf("running new stream on port %d type=mock v=%s", port, videoID)
		return ypb.NewMockStream(ctx, fixtureDir, port, mockStreamStart())
	}

	log.Printf("running new stream on port %d type=youtube v=%s", port, videoID)
	cfg := &ypb.StreamConfig{OnPrint: onPrint}
	return ypb.NewStream(ctx, videoID, port, cfg)
}

func mockStreamStart() time.Time {
	const defaultAge = 10 * 24 * time.Hour
	age := defaultAge
	if ageStr := os.Getenv("REWYT_MOCK_STREAM_AGE"); ageStr != "" {
		parsed, err := time.ParseDuration(ageStr)
		if err != nil {
			log.Fatalf("invalid REWYT_MOCK_STREAM_AGE %q: %v", ageStr, err)
		}
		age = parsed
	}
	return time.Now().Add(-age)
}
