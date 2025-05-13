#!/bin/bash

# Colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Stopping containers...${NC}"
docker-compose down
echo -e "${GREEN}Containers stopped!${NC}"
