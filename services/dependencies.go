package services

import (
    "context"
    "os/exec"
)

type DependencyStatus struct {
    Name      string `json:"name"`
    Available bool   `json:"available"`
}

type DependenciesService struct{}

func NewDependenciesService() *DependenciesService {
    return &DependenciesService{}
}

func (s *DependenciesService) CheckDependency(ctx context.Context, name string) DependencyStatus {
    _, err := exec.LookPath(name)
    return DependencyStatus{
        Name:      name,
        Available: err == nil,
    }
}

func (s *DependenciesService) CheckAllDependencies(ctx context.Context) []DependencyStatus {
    deps := []string{"yt-dlp", "ffmpeg"}
    results := make([]DependencyStatus, 0, len(deps))
    for _, dep := range deps {
        results = append(results, s.CheckDependency(ctx, dep))
    }
    return results
}
