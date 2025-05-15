# GoofyTrack

## 📱 Présentation

GoofyTrack est une application de gestion d'événements techniques permettant l'organisation de conférences avec des centaines de participants (similaire à Devoxx France). Cette plateforme offre une expérience utilisateur fluide pour les conférenciers, organisateurs et participants.

## 🎯 Objectifs
- **Pour les conférenciers** : Proposer, modifier et supprimer des talks
- **Pour les organisateurs** : Valider les talks, planifier les interventions et organiser le programme
- **Pour le public** : Consulter le planning, filtrer les contenus et gérer ses favoris

## 🏗️ Architecture du projet

### Structure technique

- **Frontend** : Next.js avec TypeScript
- **Base de données** : MariaDB
- **Gestion d'état** : (Zustand/Context API)
- **Styles** : Tailwind CSS
- **Conteneurisation** : Docker (MariaDB, Mailhog, phpMyAdmin)
- **CI/CD** : GitHub Actions pour lint, tests et build
- **Qualité de code** : ESLint, Prettier, Husky hooks

### Fonctionnalités MVP

#### 🗣️ Gestion des talks
- Création d'un talk (titre, sujet, description, durée, niveau)
- Gestion des statuts (en attente, accepté, refusé, planifié)
- Attribution manuelle par les organisateurs

#### 📅 Planning
- Créneaux entre 9h et 19h
- 5 salles disponibles
- Prévention des chevauchements
- Vue publique filtrable (jour, salle, sujet)

#### 🔒 Gestion des utilisateurs
- Authentification avec rôles (conférencier/organisateur)
- Permissions adaptées à chaque rôle

#### 🖥️ Interface
- Application responsive
- Vue privée (gestion, soumission)
- Vue publique (consultation du planning)

## 🚀 Installation et démarrage

### Prérequis
- Docker et Docker Compose
- Node.js (v18 ou supérieure)
- Yarn

### Installation

1. Cloner le dépôt :
   ```bash
   git clone [URL_du_dépôt]
   cd GoofyTrack
   ```

2. Configurer les variables d'environnement :
   ```bash
   cp .env.dist .env
   # Modifier les valeurs dans .env selon vos besoins
   ```

3. Démarrer les services Docker :
   ```bash
   docker-compose up -d
   ```

4. Installer les dépendances :
   ```bash
   yarn install
   ```

5. Démarrer l'application :
   ```bash
   yarn dev
   ```

### Services disponibles

- **Application** : http://localhost:3000
- **phpMyAdmin** : http://localhost:8080
- **Mailhog** : http://localhost:8025

## 🧑‍💻 Workflow de développement

[//]: # (### Git Flow)
[//]: # (- Branches principales : `main`, `develop`)
[//]: # (- Branches de fonctionnalités : `feature/nom-fonctionnalité`)
[//]: # (- Branches de correction : `hotfix/nom-correction`)s

### Commits
Utilisation de commits conventionnels :
- `feat:` pour les nouvelles fonctionnalités
- `fix:` pour les corrections de bugs
- `docs:` pour les mises à jour de documentation
- `chore:` pour les tâches de maintenance
- `style:` pour les changements de formatage
- `refactor:` pour les refactorisations de code
- `test:` pour l'ajout ou la modification de tests

### CI/CD
Le projet utilise GitHub Actions pour l'automatisation :
- Lint du code à chaque PR
- Exécution des tests

[//]: # (- Vérification de la couverture de code)
- Build de l'application

### Déploiement
Le projet est déployé automatiquement via Vercel :
- Déploiement de prévisualisation à chaque PR
- Déploiement automatique sur la branche `develop` pour l'environnement de staging
- Déploiement en production lors des merges sur la branche `main`
- Rollback facile en cas de problème

## 👥 Gestion du projet

- Organisation Agile allégée avec daily meetings
- Utilisation de GitHub Projects avec issues liées aux PR
- Labels pour catégoriser les tâches (frontend, backend, feature, bug)
- Estimation en story points (1-13)
- Priorisation des tâches

## 📝 Fonctionnalités bonus prévues

- Système de favoris
- Génération automatique de planning
- Filtres avancés (niveau, conférencier)
- Statistiques (répartition, taux d'occupation)
- Feedback utilisateur post-talk
- Thèmes clair/sombre
- Notifications par email

## 📄 Documentation

- API auto-documentée (Swagger)
- Documentation technique dans `/docs`
- Maquettes Figma (à venir)

