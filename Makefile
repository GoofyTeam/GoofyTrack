.PHONY: install start stop restart logs help

help:
	@echo "GoofyTrack Docker Environment"
	@echo "Usage:"
	@echo "  make install    - Setup environment files and build containers"
	@echo "  make start      - Start all containers"
	@echo "  make stop       - Stop all containers"
	@echo "  make restart    - Restart all containers"
	@echo "  make logs       - View logs"

install:
	@./bin/install.sh

start:
	@./bin/start.sh

stop:
	@./bin/stop.sh

restart:
	@./bin/restart.sh

logs:
	@./bin/logs.sh
