package main

import (
	"context"
	"fmt"

	"ypb-play/local"
)

// App struct
type App struct {
	ctx context.Context
	server *local.Server
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{server: &local.Server{}}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) StartStream(videoID string) error {
	cfg := local.ServerConfig{
		Port: 8080,
		SegmentsDir: "./local/dash/segments/",
		MPDDelay: 0,
		StreamStart: 200,
	}
	if err := a.server.Start(videoID, cfg); err != nil {
		return fmt.Errorf("starting stream server: %w", err)
	}
	return nil
}
