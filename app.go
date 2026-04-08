package main

import (
	"context"
	"log"

	"github.com/xymaxim/ypb/stream"

	"ypb-play/local"
)

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
	cfg := local.Config{
		VideoID:     videoID,
		Port:        8080,
		SegmentsDir: "./local/dash/segments/",
		MPDDelay:    0,
		StreamStart: 200,
	}
	if a.stream != nil {
		log.Println("stopping current stream")
		a.stream.Stop()
	}

	stream := local.NewStream(a.ctx, cfg)
	a.stream = stream

	go func() {
		log.Printf("starting stream v=%s addr=%s", videoID, stream.Server().Addr)
		if err := stream.Start(); err != nil {
			log.Printf("running stream: %v", err)
		}
	}()

	return nil
}
