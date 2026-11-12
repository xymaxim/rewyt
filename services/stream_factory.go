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

// allowedOrigins are the Wails webview origins allowed CORS access to the ypb server.
var allowedOrigins = []string{
	"wails://localhost",           // Wails production (Linux/macOS/iOS)
	"wails://localhost:9245",      // Wails development (Linux/macOS)
	"http://wails.localhost",      // Wails production (Windows)
	"http://wails.localhost:9245", // Wails development (Windows)
	"http://localhost:3000",       // Rewyt headless server
	"http://localhost:8080",       // Rewyt container frontend
	"http://127.0.0.1:8080",       // Rewyt container frontend
}


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
		return ypb.NewMockStream(
			ctx,
			fixtureDir,
			"",
			port,
			mockStreamStart(),
			allowedOrigins,
		)
	}

	log.Printf("running new stream on port %d type=youtube v=%s", port, videoID)
	cfg := &ypb.StreamConfig{
		OnPrint:        onPrint,
		AllowedOrigins: allowedOrigins,
	}
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
