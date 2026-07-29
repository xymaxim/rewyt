.PHONY: dev
dev:
	EXTRA_TAGS=local wails3 dev

RELEASE_VERSION := $(shell git describe --tags --abbrev=0 --match 'v*' | sed 's/^v//')

.PHONY: docs
docs:
	MDBOOK_PREPROCESSOR__VARIABLES__VARIABLES__RELEASE_VERSION="$(RELEASE_VERSION)" mdbook build docs
