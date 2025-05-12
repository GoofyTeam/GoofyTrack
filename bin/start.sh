#!/bin/bash

# Colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting containers...${NC}"
docker-compose up -d
echo -e "${GREEN}Containers started!${NC}"
