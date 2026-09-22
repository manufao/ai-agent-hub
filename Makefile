SHELL := /bin/bash

.DEFAULT_GOAL := help
.PHONY: help
help:
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Run a local development environment with Docker Compose.
	@docker compose -f ./docker/compose/docker-compose.dev.yml up --build --force-recreate

recreate: ## Recreate and run development docker compose
	@docker compose -f ./docker/compose/docker-compose.dev.yml up --build --force-recreate

down: ## Stop Docker Compose local development environment.
	@docker compose -f ./docker/compose/docker-compose.dev.yml down

clean: ## Clean Docker Compose local development environment.
	@docker compose -f ./docker/compose/docker-compose.dev.yml down --remove-orphans --volumes

.PHONY: test
test: ## Run tests
	@pnpm run test

fmt: ## Format code
	@pnpm run format

lint: ## Run static analysis
	@pnpm run lint

security: ## Run security audit and secret scan
	@pnpm run security:check

check: ## Run all checks for this project
	@pnpm run format:check
	@pnpm run lint
	@pnpm run test:types
	@pnpm run test:coverage
	@pnpm run build
	@pnpm run security:audit
