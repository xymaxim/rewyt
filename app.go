package main

import (
	"context"
	"fmt"
	"log"

	"github.com/xymaxim/ypb/stream"
)

const playbackPort = 8080

// App struct
type App struct {
	ctx    context.Context
	stream stream.Streamer
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
	}

	s, err := newStream(a.ctx, videoID, playbackPort)
	if err != nil {
		return fmt.Errorf("creating stream: %w", err)
	}

	a.stream = s

	go func() {
		if err := s.Start(); err != nil {
			log.Printf("error running stream: %v", err)
		}
	}()

	return nil
}
