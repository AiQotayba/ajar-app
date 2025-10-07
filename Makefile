# Ajar Platform - Turbo Monorepo Makefile

.PHONY: help install dev build test lint clean format

# Default target
help: ## Show this help message
	@echo "Ajar Platform - Turbo Monorepo"
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	pnpm install

dev: ## Start all apps in development mode
	pnpm dev

dev-web: ## Start web app in development mode
	pnpm web:dev
 

build: ## Build all apps
	pnpm build

build-web: ## Build web app
	pnpm web:build 

test: ## Run all tests
	pnpm test

lint: ## Lint all code
	pnpm lint

type-check: ## Type check all code
	pnpm type-check

clean: ## Clean all build artifacts
	pnpm clean
	rm -rf .turbo
	rm -rf node_modules/.cache

format: ## Format all code
	pnpm format

# Development helpers
setup: install ## Setup the project (install deps)
	@echo "Project setup complete!"

reset: clean install ## Reset the project (clean + install)
	@echo "Project reset complete!"

# Production helpers
deploy-web: build-web ## Deploy web app
	cd apps/web && pnpm deploy

deploy-admin: build-admin ## Deploy admin app
	cd apps/admin && pnpm deploy

# Utility commands
logs: ## Show recent logs
	tail -f apps/web/.next/trace

status: ## Show project status
	@echo "Node version: $$(node --version)"
	@echo "PNPM version: $$(pnpm --version)"
	@echo "Turbo version: $$(turbo --version)"
	@echo "Project structure:"
	@tree -I 'node_modules|.next|.turbo|dist' -L 3
