#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Réinitialisation de la base de données...${NC}"

# 1. Vérifier si les conteneurs sont en cours d'exécution
if ! docker ps | grep -q goofytrack-mariadb; then
  echo -e "${RED}Le conteneur MariaDB n'est pas en cours d'exécution.${NC}"
  echo -e "${YELLOW}Démarrage des conteneurs...${NC}"
  ./bin/start.sh
fi

# 2. Option : réinitialiser la base de données en exécutant directement le script SQL
echo -e "${YELLOW}Exécution du script d'initialisation...${NC}"
docker exec -i goofytrack-mariadb mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < ./docker/mariadb/init/01-init.sql
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Base de données réinitialisée avec succès !${NC}"
else
  echo -e "${RED}Erreur lors de la réinitialisation de la base de données.${NC}"
  
  # Tenter avec les valeurs hardcodées au cas où les variables d'environnement ne sont pas disponibles
  echo -e "${YELLOW}Tentative avec les valeurs par défaut...${NC}"
  docker exec -i goofytrack-mariadb mysql -u root -prootpassword goofytrack < ./docker/mariadb/init/01-init.sql
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Base de données réinitialisée avec succès !${NC}"
  else
    echo -e "${RED}Échec de la réinitialisation de la base de données.${NC}"
  fi
fi
