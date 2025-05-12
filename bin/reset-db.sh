#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Réinitialisation complète de la base de données...${NC}"

# 1. Arrêter les conteneurs
echo -e "${YELLOW}Arrêt des conteneurs...${NC}"
./bin/stop.sh

# 2. Supprimer le volume MariaDB
echo -e "${YELLOW}Suppression du volume de données...${NC}"
docker volume rm goofytrack-mariadb_data
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Volume supprimé avec succès.${NC}"
else
  echo -e "${RED}Erreur lors de la suppression du volume. Il est possible qu'il n'existe pas encore.${NC}"
fi

# 3. Redémarrer les conteneurs (cela recréera le volume et exécutera les scripts d'init)
echo -e "${YELLOW}Redémarrage des conteneurs...${NC}"
./bin/start.sh

echo -e "${GREEN}Réinitialisation complète terminée !${NC}"
echo -e "${YELLOW}Une nouvelle base de données a été créée avec le schéma initial.${NC}"
