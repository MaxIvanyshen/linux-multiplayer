
run-linux:
	@echo "Running Linux container..."
	@cd ./linux && chmod +x ./run.sh && ./run.sh
	@echo "Linux container run complete."

run-service: run-linux
	@cd ./backend && npm install
	@cd ./frontend && npm install
	@cd ./frontend && npx concurrently \
		"cd ../backend && nest start --watch" \
		"npm start"

stop:
	@echo "🛑 Stopping all services..."
	@-pkill -f "nest start"
	@-pkill -f "npm start"
	@docker stop sandbox-container 2>/dev/null || true
	@echo "✅ All services stopped"

clean: stop
	@echo "🧹 Cleaning up..."
	@docker rm sandbox-container 2>/dev/null || true
	@docker rmi sandbox:latest 2>/dev/null || true
	@echo "✅ Clean complete"

