# Décisions Techniques

Ce document détaille les principales décisions techniques prises dans le cadre du projet GoofyTrack, ainsi que leurs justifications.

## Stack Technologique

### Frontend

#### Next.js avec TypeScript

**Décision :** Utiliser Next.js 15.3.2 avec TypeScript comme framework frontend.

**Justification :**
- **Rendu hybride :** Next.js permet à la fois le rendu côté serveur (SSR), la génération statique (SSG) et le rendu côté client, offrant une flexibilité optimale pour notre application.
- **Performance :** Le rendu côté serveur améliore les performances perçues et le SEO.
- **Routing intégré :** Système de routing basé sur le système de fichiers, simplifiant la structure du projet.
- **TypeScript :** Apporte un typage statique qui réduit les erreurs et améliore la maintenabilité du code.
- **API Routes :** Permet de créer des endpoints API dans le même projet, simplifiant l'architecture.

**Alternatives considérées :**
- Create React App : Rejeté car il manque de fonctionnalités SSR et SSG natives.
- Remix : Prometteur mais moins mature que Next.js au moment de la décision.

#### Tailwind CSS avec Radix UI

**Décision :** Utiliser Tailwind CSS pour les styles avec des composants Radix UI.

**Justification :**
- **Productivité :** Tailwind permet un développement rapide avec des classes utilitaires.
- **Cohérence :** Système de design cohérent avec des variables prédéfinies.
- **Performance :** Génère uniquement le CSS utilisé, réduisant la taille du bundle.
- **Accessibilité :** Les composants Radix UI sont accessibles par défaut et s'intègrent bien avec Tailwind.

**Alternatives considérées :**
- Material UI : Trop opinionated et plus lourd.
- Bootstrap : Style visuel moins moderne et plus difficile à personnaliser.

### Backend

#### API Routes Next.js

**Décision :** Utiliser les API Routes de Next.js pour le backend.

**Justification :**
- **Simplicité :** Permet de maintenir le frontend et le backend dans un seul projet.
- **Déploiement unifié :** Un seul déploiement pour toute l'application.
- **Partage de code :** Facilite le partage de types et de logique entre le frontend et le backend.

**Alternatives considérées :**
- Express.js : Aurait nécessité un projet séparé et un déploiement distinct.
- NestJS : Plus structuré mais trop complexe pour les besoins du projet.

#### Prisma ORM

**Décision :** Utiliser Prisma comme ORM.

**Justification :**
- **Type-safety :** Génère des types TypeScript à partir du schéma de base de données.
- **Migrations :** Système de migrations intégré et facile à utiliser.
- **Requêtes optimisées :** Génère des requêtes SQL efficaces.
- **Studio :** Interface graphique pour explorer et modifier les données.

**Alternatives considérées :**
- Sequelize : Moins bien intégré avec TypeScript.
- TypeORM : Plus complexe et moins mature que Prisma.

### Base de données

#### PostgreSQL

**Décision :** Utiliser PostgreSQL comme système de gestion de base de données.

**Justification :**
- **Fiabilité :** PostgreSQL est reconnu pour sa robustesse et sa conformité SQL.
- **Fonctionnalités avancées :** Support des JSON, des index avancés et des contraintes complexes.
- **Scalabilité :** Peut évoluer avec les besoins du projet.
- **Écosystème :** Bien supporté par Prisma et les services d'hébergement comme Neon Tech.

**Alternatives considérées :**
- MySQL/MariaDB : Moins de fonctionnalités avancées.
- MongoDB : Le modèle de données du projet est fortement relationnel, rendant PostgreSQL plus adapté.

### Authentification

#### NextAuth.js

**Décision :** Utiliser NextAuth.js pour l'authentification.

**Justification :**
- **Intégration native :** S'intègre parfaitement avec Next.js.
- **Flexibilité :** Support de multiples providers d'authentification.
- **Sécurité :** Gestion des sessions et des JWT intégrée.
- **Simplicité :** API simple pour protéger les routes et obtenir les informations utilisateur.

**Alternatives considérées :**
- Auth0 : Solution payante et externe, moins de contrôle sur les données utilisateur.
- Firebase Auth : Aurait introduit une dépendance supplémentaire.

### Déploiement

#### Vercel

**Décision :** Déployer l'application sur Vercel.

**Justification :**
- **Intégration optimale :** Plateforme créée par l'équipe de Next.js, offrant une intégration parfaite.
- **Déploiements automatiques :** CI/CD intégré avec GitHub.
- **Prévisualisations :** Génération automatique d'environnements de prévisualisation pour les PR.
- **Edge Network :** Distribution globale pour des performances optimales.

**Alternatives considérées :**
- Netlify : Moins optimisé pour Next.js.
- AWS : Plus complexe à configurer et à maintenir.

#### Neon Tech pour PostgreSQL

**Décision :** Utiliser Neon Tech pour héberger la base de données PostgreSQL.

**Justification :**
- **Serverless :** Base de données PostgreSQL serverless, s'adapte automatiquement à la charge.
- **Branchement :** Possibilité de créer des branches de la base de données pour les environnements de développement.
- **Performance :** Optimisé pour les applications web modernes.
- **Coût :** Tier gratuit généreux pour les projets en phase de démarrage.

**Alternatives considérées :**
- Heroku : Plus cher et moins flexible.
- AWS RDS : Plus complexe à configurer et à maintenir.

## Architecture de l'Application

### Structure du Projet

**Décision :** Organiser le projet selon une architecture basée sur les fonctionnalités plutôt que sur les types de fichiers.

**Justification :**
- **Cohésion :** Les fichiers liés à une même fonctionnalité sont regroupés.
- **Scalabilité :** Facilite l'ajout de nouvelles fonctionnalités sans impacter les existantes.
- **Maintenabilité :** Réduit la complexité lors de la modification d'une fonctionnalité.

**Structure adoptée :**
```
/app
  /api             # API Routes
  /components      # Composants React partagés
  /features        # Fonctionnalités organisées par domaine
    /auth
    /talks
    /schedule
    /favorites
  /hooks           # Hooks React personnalisés
  /lib             # Utilitaires et services
  /prisma          # Schéma et migrations Prisma
  /public          # Fichiers statiques
  /styles          # Styles globaux
```

### Gestion d'État

**Décision :** Utiliser React Context API pour la gestion d'état globale.

**Justification :**
- **Simplicité :** Solution native à React, sans dépendance supplémentaire.
- **Suffisance :** Adapté à la complexité modérée de l'application.
- **TypeScript :** Bonne intégration avec TypeScript.

**Alternatives considérées :**
- Redux : Trop complexe pour les besoins actuels du projet.
- Zustand : Envisagé pour une future migration si la complexité augmente.

### Containerisation

**Décision :** Utiliser Docker pour l'environnement de développement.

**Justification :**
- **Cohérence :** Garantit un environnement de développement identique pour tous les membres de l'équipe.
- **Isolation :** Isole les services (PostgreSQL, pgAdmin, Mailhog) du système hôte.
- **Simplicité :** Configuration unique et partagée via docker-compose.

## Choix de Conception

### Modèle de Données

**Décision :** Concevoir un modèle de données centré sur les talks et les utilisateurs.

**Justification :**
- **Simplicité :** Modèle facile à comprendre et à maintenir.
- **Flexibilité :** Permet d'évoluer avec les besoins futurs.
- **Performance :** Optimisé pour les requêtes les plus fréquentes.

### API REST

**Décision :** Concevoir une API REST plutôt que GraphQL.

**Justification :**
- **Simplicité :** Plus simple à implémenter et à comprendre.
- **Cache HTTP :** Peut tirer parti du cache HTTP standard.
- **Suffisance :** Répond aux besoins actuels de l'application.

**Alternatives considérées :**
- GraphQL : Aurait été plus complexe à mettre en place pour les bénéfices apportés.

### Tests

**Décision :** Utiliser Jest et React Testing Library pour les tests.

**Justification :**
- **Intégration :** Bien intégré à l'écosystème React et Next.js.
- **Approche :** Testing Library encourage les tests qui reflètent l'utilisation réelle de l'application.
- **Couverture :** Permet de tester à la fois les composants UI et la logique métier.

## Décisions Spécifiques

### Gestion des Favoris

**Décision :** Implémenter les favoris comme une relation many-to-many entre utilisateurs et talks.

**Justification :**
- **Simplicité :** Modèle simple et efficace.
- **Performance :** Requêtes optimisées pour récupérer les favoris d'un utilisateur.
- **Fonctionnalité :** Répond exactement au besoin exprimé dans le cahier des charges.

### Planification des Talks

**Décision :** Implémenter une validation côté serveur pour éviter les conflits de planning.

**Justification :**
- **Intégrité des données :** Garantit qu'aucun chevauchement ne peut se produire.
- **Expérience utilisateur :** Fournit un feedback immédiat aux organisateurs.
- **Sécurité :** Empêche les manipulations côté client de contourner les règles.

## Évolutions Futures

### Génération Automatique de Planning

**Plan :** Implémenter un algorithme d'optimisation pour générer automatiquement le planning.

**Approche envisagée :**
- Utiliser un algorithme de satisfaction de contraintes.
- Prendre en compte les préférences des conférenciers et la popularité estimée des talks.
- Permettre des ajustements manuels après la génération automatique.

### Notifications

**Plan :** Ajouter un système de notifications par email et in-app.

**Approche envisagée :**
- Utiliser un service comme SendGrid pour les emails.
- Implémenter un système de notifications en temps réel avec WebSockets.
- Permettre aux utilisateurs de configurer leurs préférences de notification.
