#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up environment...${NC}"

# Copy .env.dist to .env if .env doesn't exist
if [ ! -f .env ]; then
    cp .env.dist .env
    echo -e "${GREEN}Created .env file from .env.dist${NC}"
else
    echo -e "${YELLOW}.env file already exists${NC}"
fi

# Build and start containers
echo -e "${GREEN}Building and starting containers...${NC}"
docker-compose up --build -d

# Output success message
echo -e "${GREEN}Installation complete!${NC}"
echo -e "${YELLOW}MariaDB available at localhost:$(grep MYSQL_PORT .env | cut -d '=' -f2)${NC}"
echo -e "${YELLOW}MailHog UI available at http://localhost:$(grep MAILHOG_WEB_PORT .env | cut -d '=' -f2)${NC}"
