.PHONY: dev
dev:
	EXTRA_TAGS=local wails3 dev

.PHONY: docs
docs:
	mdbook build docs
