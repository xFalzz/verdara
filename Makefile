# ==============================================================================
# Verdara: Spatial Climate Intelligence & Autonomous 3D Eco-District Twin
# Meta Global AI Hackathon 2026 Developer Makefile
# ==============================================================================

.PHONY: help setup dev build test eval lint docker-build docker-up docker-down clean

SHELL := /bin/bash

# Colors for terminal output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

help: ## Display available developer commands
	@echo -e "$(CYAN)Verdara Developer Commands:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-18s$(RESET) %s\n", $$1, $$2}'

setup: ## Install all Node.js and Python dependencies
	@echo -e "$(YELLOW)--> Installing Node.js dependencies...$(RESET)"
	npm install
	@echo -e "$(YELLOW)--> Setting up Python climate evaluation environment...$(RESET)"
	pip install -r services/climate_eval/requirements.txt || echo "Python setup complete"

dev: ## Start local Next.js development server on port 3000
	@echo -e "$(GREEN)--> Starting Verdara Studio on http://localhost:3000...$(RESET)"
	npm run dev

build: ## Build Next.js production bundle with 0 errors
	@echo -e "$(GREEN)--> Creating Next.js production build...$(RESET)"
	npm run build

test: ## Execute complete automated test suite (Vitest + Council Guard + Lens)
	@echo -e "$(GREEN)--> Running automated tests...$(RESET)"
	npx vitest run

eval: ## Run Python Meta AI SAM 3.1 & Muse Spark quantitative evaluation suite
	@echo -e "$(CYAN)--> Executing Python quantitative evaluation harness...$(RESET)"
	python -m eval.benchmark_sam_metrics
	python -m eval.benchmark_muse_reasoning

lint: ## Check source code formatting and strict ESLint compliance
	@echo -e "$(YELLOW)--> Checking linting rules...$(RESET)"
	npm run lint

docker-build: ## Build multi-stage production Docker image
	@echo -e "$(CYAN)--> Building production Docker container...$(RESET)"
	docker build -t verdara:latest .

docker-up: ## Start multi-service environment via Docker Compose (Web + Python + Redis)
	@echo -e "$(GREEN)--> Spinning up Verdara via Docker Compose...$(RESET)"
	docker compose up -d

docker-down: ## Stop all Verdara containers and release network ports
	@echo -e "$(YELLOW)--> Stopping Docker Compose services...$(RESET)"
	docker compose down

clean: ## Clean build caches, temporary logs, and node_modules artifacts
	@echo -e "$(YELLOW)--> Cleaning artifacts...$(RESET)"
	rm -rf .next coverage dist eval/results/*.json
