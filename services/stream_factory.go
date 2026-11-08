package services

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"strconv"
	"time"

	"github.com/xymaxim/ypb"
)

// maxPortAttempts mirrors ypb's own port fallback range.
const maxPortAttempts = 10

// findFreePort returns the first bindable port in start..start+maxPortAttempts-1.
func findFreePort(start int) (int, error) {
	last := min(start+maxPortAttempts-1, 65535)
	var lastErr error
	for p := start; p <= last; p++ {
		ln, err := net.Listen("tcp", ":"+strconv.Itoa(p))
		if err != nil {
			lastErr = err
			continue
		}
		_ = ln.Close()
		return p, nil
	}
	return 0, fmt.Errorf("no free port found in range %d-%d: %w", start, last, lastErr)
}

func newStream(ctx context.Context, videoID string, port int, onPrint func([]byte)) (ypb.Streamer, error) {
	if fixtureDir := os.Getenv("REWYT_MOCK_FIXTURE_DIR"); fixtureDir != "" {
		log.Printf("running new stream on port %d type=mock v=%s", port, videoID)
		return ypb.NewMockStream(ctx, fixtureDir, "", port, mockStreamStart())
	}

	log.Printf("running new stream on port %d type=youtube v=%s", port, videoID)
	cfg := &ypb.StreamConfig{OnPrint: onPrint}
	return ypb.NewStream(ctx, videoID, "", port, cfg)
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
