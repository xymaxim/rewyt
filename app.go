package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/xymaxim/ypb/stream"
)

const playbackPort = 8080

// App struct
type App struct {
	ctx         context.Context
	stream      stream.Streamer
	startCtx    context.Context
	startCancel context.CancelFunc
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) StartStream(videoID string) error {
	if a.stream != nil {
		log.Println("stopping current stream")
		a.stream.Stop()
		a.startCancel()
	}

	startCtx, cancel := context.WithCancel(a.ctx)
	a.startCtx = startCtx
	a.startCancel = cancel

	s, err := newStream(startCtx, videoID, playbackPort)
	if err != nil {
		a.startCancel()
		return fmt.Errorf("creating stream: %w", err)
	}

	a.stream = s

	go func() {
		if err := s.Start(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Printf("error running stream: %v", err)
		}
	}()

	return nil
}

func (a *App) CancelStreamStart() error {
	if a.startCancel == nil {
		return nil
	}
	a.startCancel()
	return nil
}
