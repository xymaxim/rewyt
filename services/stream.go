package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/xymaxim/ypb"
)

const playbackPort = 9001

type StreamService struct {
	ctx         context.Context
	stream      ypb.Streamer
	startCancel context.CancelFunc
	port        int
}

func NewStreamService() *StreamService {
	return &StreamService{port: playbackPort}
}

func (s *StreamService) GetPlaybackPort() int {
	return s.port
}

// ServiceStartup is called when the service is registered
func (s *StreamService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	s.ctx = ctx
	return nil
}

// StartStream starts a new stream
func (s *StreamService) StartStream(videoID string) error {
	if s.stream != nil {
		log.Println("stopping current stream")
		s.stream.Stop()
		if s.startCancel != nil {
			s.startCancel()
		}
	}

	startCtx, cancel := context.WithCancel(s.ctx)
	s.startCancel = cancel

	port, err := findFreePort(playbackPort)
	if err != nil {
		s.stream = nil
		cancel()
		return fmt.Errorf("finding playback port: %w", err)
	}

	onYpbPrint := func(b []byte) {
		app := application.Get()
		app.Event.Emit("stream-stdout", string(b))
	}

	str, err := newStream(startCtx, videoID, port, onYpbPrint)
	if err != nil {
		s.stream = nil
		cancel()
		return fmt.Errorf("creating stream: %w", err)
	}

	log.Printf("using playback port %d", port)
	s.stream = str
	s.port = port

	go func() {
		err := str.Start()
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Printf("error running stream: %v", err)
		}
	}()

	return nil
}

// CancelStreamStart cancels the current stream startup
func (s *StreamService) CancelStreamStart() error {
	if s.startCancel == nil {
		return nil
	}
	s.startCancel()
	return nil
}

// Shutdown is called when the service shuts down
func (s *StreamService) Shutdown(ctx context.Context) error {
	if s.stream != nil {
		s.stream.Stop()
	}
	if s.startCancel != nil {
		s.startCancel()
	}
	return nil
}
