# Changelog

The format of this changelog is based on [Keep a
Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow [Calendar
Versioning](https://calver.org).

## [2026.10.1](https://github.com/xymaxim/rewyt/releases/tag/v2026.10.1)

### Changed

- Rebuilt the container image to get the updated `ypb` image and Wolfi's
  `ffmpeg` with `libvpx` enabled, see
  [wolfi-dev/os@e460103](https://github.com/wolfi-dev/os/commit/e46010302f5d44e0c0d535240b6a426bcb4a4adf)

## [2026.9.30](https://github.com/xymaxim/rewyt/releases/tag/v2026.9.30)

### Added

- "Edit selected time" button to enter a timestamp in a dialog
- "Use playhead" button to set the selected time to the playhead position
- Configurable tick intervals for the timeline
- New Rewyt logo and icons

### Changed

- Reworked the video overlay and player controls
- Redesigned the website's main page

### Removed

- "Play/Pause" button from the main bar

### Fixed

- Timeline ticks now start at local midnight, so hour labels match local time

## [2026.9.9](https://github.com/xymaxim/rewyt/releases/tag/v2026.9.9)

### Added

- Rewind to a specific moment or interval via a single input dialog
- Pan the timeline one view range at a time with edge buttons
- Fit-to-view and edit buttons for intervals
- Rewind or jump to an interval mark with tooltip buttons
- Show interval duration while dragging
- Live edge indicator in player controls
- Copy the `ypb` download command with copy-toast feedback
- Toast notifications with icon support

### Fixed

- Clamp interval thumbs to the available range during dragging
- Stop timeline ticks and mask from intercepting pointer events
- Improve manifest reload and initial seek reliability
- Update view range and selected time after going live

## [2026.8.28](https://github.com/xymaxim/rewyt/releases/tag/v2026.8.28)

First release.
