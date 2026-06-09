package main

import (
	"embed"

	"rewyt/services"
	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	application.RegisterEvent[string]("stream-stdout")
}

func main() {
	streamService := services.NewStreamService()
	
	app := application.New(application.Options{
		Name: "Rewyt",
		Services: []application.Service{
			application.NewService(streamService),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
	})

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:            "Rewyt",
		Width:            1024,
		Height:           768,
		BackgroundColour: application.NewRGBA(27, 38, 54, 255),
	})

	err := app.Run()
	if err != nil {
		panic(err)
	}
}
